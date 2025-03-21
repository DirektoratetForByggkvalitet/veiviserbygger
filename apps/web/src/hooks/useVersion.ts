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
  getNodeRef,
  removeExpressionClause,
} from '@/services/firebase'
import { curry } from 'lodash'

export function useVersion() {
  const { firestore } = useFirebase()
  const { wizardId = '', versionId = '' } = useParams()

  if (!wizardId || !versionId) {
    console.error('Missing wizardId or versionId')
  }

  return {
    getNodeRef: curry(getNodeRef)({ db: firestore, wizardId, versionId }),
    createPage: curry(createPage)({ db: firestore, wizardId, versionId }),
    patchPage: curry(patchPage)({ db: firestore, wizardId, versionId }),
    deletePage: curry(deletePage)({ db: firestore, wizardId, versionId }),
    addNodes: curry(addNodes)({ db: firestore, wizardId, versionId }),
    patchNode: curry(patchNode)({ db: firestore, wizardId, versionId }),
    removeExpressionClause: curry(removeExpressionClause)({ db: firestore, wizardId, versionId }),
    reorderNodes: curry(reorderNodes)({ db: firestore, wizardId, versionId }),
    deleteNode: curry(deleteNode)({ db: firestore, wizardId, versionId }),
    addAnswer: curry(addAnswer)({ db: firestore, wizardId, versionId }),
    patchAnswer: curry(patchAnswer)({ db: firestore, wizardId, versionId }),
    deleteAnswer: curry(deleteAnswer)({ db: firestore, wizardId, versionId }),
    reorderAnswers: curry(reorderAnswers)({ db: firestore, wizardId, versionId }),
  }
}
