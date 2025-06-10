import { DocumentReference } from 'firebase/firestore'
import { isArray, isObject } from 'lodash'

export type Reference = {
  /**
   * The document that is the source of the data being searched.
   */
  doc: DocumentReference
  /**
   * The referenced document
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

type TreeBranch = {
  ref: DocumentReference
  path: string[]
  type: Reference['type']
}

export type TreeNode = {
  doc: DocumentReference
  incoming: TreeBranch[]
  outgoing: TreeBranch[]
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
 *
 * @param sourceRef - Reference to the document that is the source of the {@link data}.
 * @param data - The data to search for DocumentReference instances.
 * @param path - The current path in the data object, used for recursion.
 * @returns An array of Reference objects containing the DocumentReference, its path relative to the start of the recursion, and its type.
 */
export function findRefs(sourceRef: DocumentReference, data: any, path?: string[]): Reference[] {
  // If the data is an array, we need to iterate through each item
  if (isArray(data)) {
    return data.flatMap((item, index) =>
      findRefs(sourceRef, item, [...(path || []), String(index)]),
    )
  }

  // Skip uninteresting values
  if (isUninteresting(data)) {
    return []
  }

  // If the data is a DocumentReference, return it with its path and type. These are the only values we really care about.
  if (data instanceof DocumentReference) {
    return [
      {
        doc: sourceRef,
        ref: data,
        path: path || [],
        type: determineType(path),
      },
    ]
  }

  // If the data is an object, we need to iterate through its entries
  if (isObject(data)) {
    return Object.entries(data).flatMap(([key, value]) =>
      findRefs(sourceRef, value, [...(path || []), key]),
    )
  }

  // If the data is neither an array, object, nor DocumentReference, we return an empty array
  return []
}

export function buildTree(refs: Reference[]): TreeNode[] {
  const treeNodes: TreeNode[] = []

  return refs.reduce<TreeNode[]>((acc, ref) => {
    // check if the node already exists in list
    const nodeIndex = acc.findIndex((n) => n.doc.path === ref.doc.path)

    // no node found, create a new one
    if (nodeIndex === -1) {
      return [
        ...acc,
        {
          doc: ref.doc,

          // incoming references are all references that point to this node
          incoming: refs
            .filter((r) => r.ref.path === ref.doc.path)
            .map((r) => ({
              path: r.path,
              ref: r.doc,
              type: r.type,
            })),

          // outgoing references are all references that this node points to
          outgoing: [
            {
              path: ref.path,
              ref: ref.ref,
              type: ref.type,
            },
          ],
        },
      ]
    }

    // node already exists, add the outgoing reference to it
    return [
      ...acc.slice(0, nodeIndex),
      {
        ...acc[nodeIndex],
        outgoing: [
          ...acc[nodeIndex].outgoing,
          {
            path: ref.path,
            ref: ref.ref,
            type: ref.type,
          },
        ],
      },
      ...acc.slice(nodeIndex + 1),
    ]
  }, [])
}
