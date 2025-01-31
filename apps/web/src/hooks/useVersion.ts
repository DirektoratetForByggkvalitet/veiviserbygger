import { useParams } from 'react-router'
import useFirebase from './useFirebase'
import {
  createPage,
  deletePage,
  patchPage,
  addNode,
  patchNode,
  addAnswer,
  deleteAnswer,
  reorderNodes,
  patchAnswer,
} from '@/services/firebase'
import { curry } from 'lodash'

export function useVersion() {
  const { firestore } = useFirebase()
  const { wizardId = '', versionId = '' } = useParams()

  if (!wizardId || !versionId) {
    console.error('Missing wizardId or versionId')
  }

  return {
    createPage: curry(createPage)({ db: firestore, wizardId, versionId }),
    patchPage: curry(patchPage)({ db: firestore, wizardId, versionId }),
    deletePage: curry(deletePage)({ db: firestore, wizardId, versionId }),
    addNode: curry(addNode)({ db: firestore, wizardId, versionId }),
    patchNode: curry(patchNode)({ db: firestore, wizardId, versionId }),
    reorderNodes: curry(reorderNodes)({ db: firestore, wizardId, versionId }),
    addAnswer: curry(addAnswer)({ db: firestore, wizardId, versionId }),
    patchAnswer: curry(patchAnswer)({ db: firestore, wizardId, versionId }),
    deleteAnswer: curry(deleteAnswer)({ db: firestore, wizardId, versionId }),
  }
}
