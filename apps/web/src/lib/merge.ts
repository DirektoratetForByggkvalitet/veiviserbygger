import { DocumentReference, FieldValue, deleteField } from 'firebase/firestore'
import { concat, fromPairs, isArray, isObject, keys, set, uniq } from 'lodash'

function isUnmergeable(value: any) {
  if (value instanceof Date) return true
  if (value instanceof RegExp) return true
  if (value instanceof Function) return true
  if (value instanceof DocumentReference) return true
  if (value instanceof FieldValue) return true
  return false
}

export function merge<T extends Record<string, any>, P extends Record<string, any>>(
  ...objects: [T, ...P[]]
) {
  return objects.reduce(
    (result, current) => {
      if (isArray(current)) {
        throw new Error('arguments to merge must be objects')
      }

      keys(current).forEach((key) => {
        // explicitly unset a value using the unset symbol
        if (isUnset(current[key])) {
          delete result[key]
          return
        }

        // handle special types in JS that can't be merged
        if (isUnmergeable(current[key])) {
          set(result, key, current[key])
          return
        }

        // merge arrays
        if (isArray(result[key]) && isArray(current[key])) {
          set(result, key, uniq(concat(result[key], current[key])))
          return
        }

        // merge objects
        if (isObject(current[key]) && isObject(result[key])) {
          set(result, key, merge(result[key], current[key]))
          return
        }

        // overwrite other values
        set(result, key, current[key])
      })

      return result
    },
    {} as P & T,
  ) as P & T
}

/**
 * Symbol used to unset a destination value in a merge operation
 */
export const unset = Symbol('unset')

function isUnset(value: any) {
  return value?.toString() === 'Symbol(unset)'
}

/**
 * Build Firestore deleteField() sentinels for the top-level keys that are unset in a patch.
 *
 * Firestore's update() leaves fields that are omitted untouched, so dropping a key in merge()
 * is not enough to remove a top-level field. deleteField() is only allowed at the top level of
 * update data though, so nested unsets are handled by merge() dropping the key (update()
 * replaces nested maps wholesale).
 */
export function topLevelDeletes(patch: Record<string, any>) {
  return fromPairs(
    keys(patch)
      .filter((key) => isUnset(patch[key]))
      .map((key) => [key, deleteField()]),
  )
}
