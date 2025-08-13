import { DocumentReference } from 'firebase/firestore'
import { getDependencyTree } from '..'
import { Reference } from './refs'
import { Intro, OptionalExcept, PageContent, WizardPage, WizardVersion } from 'types'
import { values } from 'lodash'
import { getOrdered } from 'shared/utils'

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

export type ValidationError = {
  doc: DocumentReference
  path: Reference['path']
  warning?: boolean
  message: string
}

type WithDocRef<T> = T & { doc: DocumentReference }

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

  // we're at the end of the recursion, so we can return the additional deletes for nodes that has been
  // orphaned (i.e. they have no incoming references)
  if (visitedNodes.length === 0) {
    additionalDeletes.push(
      ...treeNodes
        .filter(
          (n) =>
            n.incoming.length === 0 &&
            n.doc.path.includes('/nodes/') &&
            !additionalDeletes.some((d) => d.doc.path === n.doc.path),
        )
        .flatMap((n) => ({
          doc: n.doc,
          reason: 'unreferenced' as Reason,
        })),
    )
  }

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

function validatePage(
  page: WizardPage | Intro | undefined,
  doc: DocumentReference,
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!page) return errors

  if (!page.heading) {
    errors.push({
      doc,
      path: page.type === 'Intro' ? ['intro', 'heading'] : ['pages', page.id, 'heading'],
      message: 'Heading is required',
    })
  }

  console.log(page, errors)

  return errors
}

function validateVersion(doc: WithDocRef<WizardVersion>): ValidationError[] {
  const errors: ValidationError[] = [
    ...validatePage(doc.intro, doc.doc),
    ...getOrdered(doc.pages).flatMap((p) => validatePage(p, doc.doc)),
  ]

  return errors
}

function validateNode(
  doc: WithDocRef<OptionalExcept<PageContent, 'type' | 'id'>>,
): ValidationError[] {
  const errors: ValidationError[] = []

  if (doc.type !== 'Branch' && !doc.heading) {
    errors.push({
      doc: doc.doc,
      path: ['heading'],
      message: 'Heading is required',
    })
  }

  return errors
}

export function validate(
  version: WithDocRef<WizardVersion>,
  nodes: Array<WithDocRef<OptionalExcept<PageContent, 'type' | 'id'>>>,
): ValidationError[] {
  const errors = [...validateVersion(version), ...values(nodes).flatMap((doc) => validateNode(doc))]

  console.log('::: validate', errors)

  return errors
}
