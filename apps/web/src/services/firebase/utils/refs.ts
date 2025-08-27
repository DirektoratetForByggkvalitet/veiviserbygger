import { DocumentReference } from 'firebase/firestore'
import { isArray, isEqual, isObject } from 'lodash'

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

interface DocumentSnapshotLike {
  get ref(): DocumentReference
  data(): any
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

/**
 * Builds a list of documents with their incoming and outgoing references. This can be used to
 * render a tree of nodes and their references, to check for orphan nodes, check if a node is
 * deletable, or to visualize the structure of the nodes.
 *
 * @param docs - An array of DocumentSnapshotLike objects, each representing a document with its reference and data.
 * @returns An array of TreeNode objects, each containing the document reference, incoming references, and outgoing references.
 */
export function buildTree(docs: DocumentSnapshotLike[]): TreeNode[] {
  const refs = docs.flatMap((d) => findRefs(d.ref, d.data()))

  return docs.map(({ ref }) => ({
    doc: ref,

    // incoming references are all references that point to this node
    incoming: refs
      .filter((r) => r.ref.path === ref.path)
      .map((r) => ({
        path: r.path,
        ref: r.doc,
        type: r.type,
      })),

    // outgoing references are all references that this node points to
    outgoing: refs
      .filter((r) => r.doc.path === ref.path)
      .map((r) => ({
        path: r.path,
        ref: r.ref,
        type: r.type,
      })),
  }))
}

/**
 * Gets a list of DocumentReference to tree nodes that are referenced directly or indirectly
 * as content nodes in the documentReference document. It traverses the tree by following
 * outgoing references with the content-node type recursively.
 *
 * @param documentReference - The starting document reference from which to find content dependencies.
 * @param treeNodes - The list of all tree nodes to traverse.
 * @param startNodePath - Page id of the page in the
 */
export function getContentDeps(
  versionDocRef: DocumentReference,
  pageId: 'intro' | string,
  treeNodes: TreeNode[],
) {
  const startNode = treeNodes.find((n) => n.doc.path === versionDocRef.path)
  if (!startNode) return []

  const visitedNodes: string[] = []
  const collectedRefs: DocumentReference[] = []

  function visitNode(node: TreeNode) {
    if (visitedNodes.includes(node.doc.path)) return
    visitedNodes.push(node.doc.path)

    const outgoingRefs =
      node === startNode
        ? node.outgoing.filter(
            (r) =>
              (pageId === 'intro' && r.path[0] === 'intro') ||
              isEqual(r.path.slice(0, 2), ['pages', pageId]),
          )
        : node.outgoing

    outgoingRefs.forEach((outgoing) => {
      if (!collectedRefs.find((r) => r.path === outgoing.ref.path)) {
        collectedRefs.push(outgoing.ref)
      }

      const nextNode = treeNodes.find((n) => n.doc.path === outgoing.ref.path)

      if (nextNode) {
        visitNode(nextNode)
      }
    })
  }

  visitNode(startNode)

  return collectedRefs
}
