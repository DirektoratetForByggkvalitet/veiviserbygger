import { useParams } from 'react-router'
import useFirebase from './useFirebase'
import {
  createPage,
  deletePage,
  patchPage,
  addNodes,
  patchNode,
  addAnswer,
  deleteAnswer,
  reorderNodes,
  patchAnswer,
  reorderAnswers,
  deleteNode,
  patchVersion,
  getNodeRef,
  removeExpressionClause,
  publishVersion,
  createDraftVersion,
  patch,
  getWizardVersionRef,
  validateDelete,
  updateAnswerImage,
  moveNode,
} from '@/services/firebase'
import { curry } from 'lodash'

export function useVersion() {
  const { firestore, storage } = useFirebase()
  const { wizardId = '', versionId = '' } = useParams()

  if (!wizardId || !versionId) {
    console.error('Missing wizardId or versionId')
  }

  return {
    patch: curry(patch)({ db: firestore, storage, wizardId, versionId }),
    getNodeRef: curry(getNodeRef)({ db: firestore, wizardId, versionId }),
    getVersionRef: () => getWizardVersionRef({ db: firestore, wizardId, versionId }),
    createPage: curry(createPage)({ db: firestore, storage, wizardId, versionId }),
    patchPage: curry(patchPage)({ db: firestore, storage, wizardId, versionId }),
    deletePage: curry(deletePage)({ db: firestore, storage, wizardId, versionId }),
    addNodes: curry(addNodes)({ db: firestore, storage, wizardId, versionId }),
    patchNode: curry(patchNode)({ db: firestore, storage, wizardId, versionId }),
    removeExpressionClause: curry(removeExpressionClause)({
      db: firestore,
      storage,
      wizardId,
      versionId,
    }),
    reorderNodes: curry(reorderNodes)({ db: firestore, storage, wizardId, versionId }),
    deleteNode: curry(deleteNode)({ db: firestore, storage, wizardId, versionId }),
    moveNode: curry(moveNode)({ db: firestore, storage, wizardId, versionId }),
    addAnswer: curry(addAnswer)({ db: firestore, storage, wizardId, versionId }),
    patchAnswer: curry(patchAnswer)({ db: firestore, storage, wizardId, versionId }),
    updateAnswerImage: curry(updateAnswerImage)({ db: firestore, storage, wizardId, versionId }),
    deleteAnswer: curry(deleteAnswer)({ db: firestore, storage, wizardId, versionId }),
    reorderAnswers: curry(reorderAnswers)({ db: firestore, storage, wizardId, versionId }),
    patchVersion: curry(patchVersion)({ db: firestore, storage, wizardId, versionId }),
    createDraftVersion: (copyFromVersionId?: string) =>
      createDraftVersion({ db: firestore, storage, wizardId }, copyFromVersionId),
    publishVersion: () => curry(publishVersion)({ db: firestore, storage, wizardId, versionId }),
    validateDelete: curry(validateDelete)({ db: firestore, storage, wizardId, versionId }),
  }
}
