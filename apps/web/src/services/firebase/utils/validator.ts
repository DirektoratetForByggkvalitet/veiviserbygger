import { DocumentReference } from 'firebase/firestore'
import { getDependencyTree } from '..'
import { Reference } from './refs'

type Reason = 'unreferenced' | 'unreferenced-after-delete' | 'orphaned' | 'referenced'

type IsDeleteAllowedResult = {
  allowed: boolean
  reason: Reason
  blockedBy?: {
    doc: DocumentReference
    path: Reference['path']
    type: Reference['type']
  }[]
  additionalDeletes?: {
    doc: DocumentReference
    reason: Reason
  }[]
}

/**
 * Recursive function that checks for nodes that are referenced by the node that has
 * no other incoming references. Such nodes can be deleted as well, because they will
 * become unreferencefd after the deletion of the node.
 */
export function findAdditionalDeletes(
  treeNodes: Awaited<ReturnType<typeof getDependencyTree>>,
  node: DocumentReference,
  visitedNodes: DocumentReference[] = [],
): { doc: DocumentReference; reason: Reason }[] {
  const nodeToDelete = treeNodes.find((n) => n.doc.path === node.path)
  if (!nodeToDelete) return []

  const additionalDeletes = nodeToDelete.outgoing
    // filter out nodes that have already been visited to prevent infinite loops
    .filter((outgoing) => !visitedNodes.some((n) => n.path === outgoing.ref.path))

    // filter out nodes that have more than one incoming reference, because they cannot be deleted
    .filter(
      (outgoing) => treeNodes.find((n) => n.doc.path === outgoing.ref.path)?.incoming.length === 1,
    )

    // return the additional deletes for the outgoing nodes, add to visitedNodes and continue the recursion
    .flatMap((outgoing) => {
      return [
        {
          doc: outgoing.ref,
          reason: 'unreferenced-after-delete' as Reason,
        },
        ...findAdditionalDeletes(treeNodes, outgoing.ref, [...visitedNodes, outgoing.ref]),
      ]
    })

  return additionalDeletes
}

export function isDeleteAllowed(
  treeNodes: Awaited<ReturnType<typeof getDependencyTree>>,

  /**
   * The node that is being checked for deletion
   */
  node: DocumentReference,

  /**
   * Reference from which the node is being deleted. When deleting a node that is
   * visible somewhere, this is the reference to the document in which the node is
   * being deleted. In addition to the node document reference, we need the path
   * to the reference inside the document.
   */
  ref?: {
    doc: DocumentReference
    path: string[]
  },
): IsDeleteAllowedResult {
  const nodeToDelete = treeNodes.find((n) => n.doc.path === node.path)
  const blockingIncomingRefs = nodeToDelete?.incoming?.filter(
    (incoming) =>
      incoming.ref.path !== ref?.doc.path || incoming.path.join('.') !== ref?.path.join('.'),
  )

  if (blockingIncomingRefs?.length) {
    return {
      allowed: false,
      reason: 'referenced',
      blockedBy: blockingIncomingRefs.map((incoming) => ({
        doc: incoming.ref,
        path: incoming.path,
        type: incoming.type,
      })),
    }
  }

  return {
    allowed: true,
    reason: nodeToDelete?.incoming.length ? 'unreferenced-after-delete' : 'unreferenced',
    additionalDeletes: findAdditionalDeletes(treeNodes, node),
  }
}
