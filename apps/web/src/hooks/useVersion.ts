import { useParams } from 'react-router'
import useFirebase from './useFirebase'
import {
  createPage as firestoreCreatePage,
  deletePage as firestoreDeletePage,
  patchPage as firestorePatchPage,
  addNode as firestoreAddNode,
} from '@/services/firebase'
import { curry } from 'lodash'
import { useCallback } from 'react'

export function useVersion() {
  const { firestore } = useFirebase()
  const { wizardId = '', versionId = '' } = useParams()

  const createPage = useCallback(curry(firestoreCreatePage)(firestore, wizardId, versionId), [
    wizardId,
    versionId,
  ])

  const patchPage = useCallback(curry(firestorePatchPage)(firestore, wizardId, versionId), [
    wizardId,
    versionId,
  ])

  const deletePage = useCallback(curry(firestoreDeletePage)(firestore, wizardId, versionId), [
    wizardId,
    versionId,
  ])

  const addNode = useCallback(curry(firestoreAddNode)(firestore, wizardId, versionId), [
    wizardId,
    versionId,
  ])

  if (!wizardId || !versionId) {
    console.error('Missing wizardId or versionId')
  }

  return {
    createPage,
    patchPage,
    deletePage,
    addNode,
  }
}
