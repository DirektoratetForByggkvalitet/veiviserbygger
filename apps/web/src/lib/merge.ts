import { DocumentReference, FieldValue } from 'firebase/firestore'
import { concat, isArray, isObject, keys, set, uniq } from 'lodash'

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
        if (current[key]?.toString() === 'Symbol(unset)') {
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
