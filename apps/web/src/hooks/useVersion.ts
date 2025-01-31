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
  patchAnswer,
  reorderNodes,
} from '@/services/firebase'
import { curry } from 'lodash'

export function useVersion() {
  const { firestore } = useFirebase()
  const { wizardId = '', versionId = '' } = useParams()

  if (!wizardId || !versionId) {
    console.error('Missing wizardId or versionId')
  }

  return {
    createPage: curry(createPage)(firestore, wizardId, versionId),
    patchPage: curry(patchPage)(firestore, wizardId, versionId),
    deletePage: curry(deletePage)(firestore, wizardId, versionId),
    addNode: curry(addNode)(firestore, wizardId, versionId),
    patchNode: curry(patchNode)(firestore, wizardId, versionId),
    reorderNodes: curry(reorderNodes)(firestore, wizardId, versionId),
    addAnswer: curry(addAnswer)(firestore, wizardId, versionId),
    deleteAnswer: curry(deleteAnswer)(firestore, wizardId, versionId),
    patchAnswer: curry(patchAnswer)(firestore, wizardId, versionId),
  }
}
