import { DocumentReference } from 'firebase/firestore'
import { isArray, isObject } from 'lodash'

export type Reference = {
  /**
   * Reference to the document that references the node
   */
  ref: DocumentReference
  /**
   * Path to the document field that references the node
   */
  path: string[]
  /**
   * Type of reference
   */
  type: 'content-node' | 'in-expression' | 'unknown'
}

/**
 * Check if the value is uninteresting and can be ignored. Uninteresting values
 * include Date, RegExp, and Function instances since they will never reference a node.
 */
export function isUninteresting(value: any) {
  if (value instanceof Date) return true
  if (value instanceof RegExp) return true
  if (value instanceof Function) return true
  return false
}

/**
 * Determine the type of reference based on the path
 */
export function determineType(path?: string[]): Reference['type'] {
  const reversed = [...(path || [])].reverse()

  if (reversed[0] === 'node' && reversed.includes('content')) return 'content-node'
  if (reversed[0] === 'field') return 'in-expression'
  return 'unknown'
}

/**
 * Recursively find all DocumentReference instances in the data object and return their paths and types.
 */
export default function findRefs(data: any, path?: string[]): Reference[] {
  // If the data is an array, we need to iterate through each item
  if (isArray(data)) {
    return data.flatMap((item, index) => findRefs(item, [...(path || []), String(index)]))
  }

  // Skip uninteresting values
  if (isUninteresting(data)) {
    return []
  }

  // If the data is a DocumentReference, return it with its path and type. These are the only values we really care about.
  if (data instanceof DocumentReference) {
    console.log('Found DocumentReference:', data.path, 'at path:', path)

    return [
      {
        ref: data,
        path: path || [],
        type: determineType(path),
      },
    ]
  }

  // If the data is an object, we need to iterate through its entries
  if (isObject(data)) {
    return Object.entries(data).flatMap(([key, value]) => findRefs(value, [...(path || []), key]))
  }

  // If the data is neither an array, object, nor DocumentReference, we return an empty array
  return []
}
