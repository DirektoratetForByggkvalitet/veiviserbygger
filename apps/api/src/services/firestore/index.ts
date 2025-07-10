import { DocumentReference, Firestore } from 'firebase-admin/firestore'
import { dataPoint } from './utils'
import { nodesRef, wizardsRef, wizardVersionsRef } from 'shared/firestore'
import { CustomError } from 'shared/error'
import { OptionalExcept, PageContent } from 'types'

type FuncScope = {
  db: Firestore
  wizardId: string
  versionId: string
}

export async function getDocument(ref: DocumentReference) {
  return (await ref.get()).data()
}

export function getWizardsRef(db: Firestore) {
  return dataPoint(db, wizardsRef())
}

export function getWizardRef(db: Firestore, wizardId: string) {
  return getWizardsRef(db).doc(wizardId)
}

export function getWizardVersionsRef(db: Firestore, wizardId: string) {
  return dataPoint(db, wizardVersionsRef(wizardId))
}

export function getWizardVersionRef({ db, wizardId, versionId }: FuncScope) {
  return getWizardVersionsRef(db, wizardId).doc(versionId)
}

export function getNodesRef({ db, wizardId, versionId }: FuncScope) {
  return dataPoint(db, nodesRef(wizardId, versionId))
}

export function getNodeRef({ db, wizardId, versionId }: FuncScope, nodeId: string) {
  return getNodesRef({ db, wizardId, versionId }).doc(nodeId)
}

/**
 * Get the complete wizard with nodes, wizard and version data. If no @param versionId
 * is provided, it will return the published version of the wizard.
 *
 * @param db Firestore instance
 * @param wizardId Wizard ID
 * @returns Wizard data or null if not found
 */
export async function getCompleteWizard(db: Firestore, wizardId: string, versionId?: string) {
  const wizard = await getWizardRef(db, wizardId).get()

  if (!wizard.exists) {
    throw new CustomError('NOT_FOUND', 'Wizard not found')
  }

  const wizardVersionId = versionId || wizard.data()?.publishedVersion?.id

  if (!wizardVersionId) {
    throw new CustomError('NOT_FOUND', 'No published version found')
  }

  const version = await getWizardVersionRef({
    db,
    wizardId,
    versionId: wizardVersionId,
  }).get()

  if (!version.exists) {
    throw new CustomError('NOT_FOUND', 'Version not found')
  }

  const nodes = await getNodesRef({ db, wizardId, versionId: version.id }).get()

  return {
    wizard: {
      ...wizard.data(),
      id: wizard.id,
    },
    version: {
      ...version.data(),
      id: version.id,
    },
    nodes: nodes.docs.reduce<{
      [id: string]: { id: string } & OptionalExcept<PageContent, 'type'>
    }>(
      (res, node) => ({
        ...res,
        [node.id]: {
          id: node.id,
          ...node.data(),
        },
      }),
      {},
    ),
  }
}
