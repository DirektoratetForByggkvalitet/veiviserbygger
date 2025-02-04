import { useParams } from 'react-router'
import useFirebase from './useFirebase'
import { patchNode, getNodeRef, deleteNode } from '@/services/firebase'
import { curry } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { DocumentReference, onSnapshot } from 'firebase/firestore'
import { OptionalExcept, PageContent } from 'types'

export function useNode(nodeId: DocumentReference['id']) {
  const { firestore } = useFirebase()
  const [data, setData] = useState<OptionalExcept<PageContent, 'type'>>()
  const { wizardId = '', versionId = '' } = useParams()

  const patch = useCallback(curry(patchNode)({ db: firestore, wizardId, versionId }, nodeId), [
    firestore,
    wizardId,
    versionId,
    nodeId,
  ])

  const del = useCallback(
    () => deleteNode({ db: firestore, wizardId, versionId }, nodeId),
    [firestore, wizardId, versionId, nodeId],
  )

  useEffect(() => {
    const unsubNode = onSnapshot(
      getNodeRef({ db: firestore, wizardId, versionId }, nodeId),
      (snapshot) => {
        setData(snapshot.data())
      },
    )

    return () => {
      unsubNode?.()
    }
  }, [nodeId])

  if (!wizardId || !versionId || !nodeId) {
    console.error('Missing wizardId or versionId or nodeId')
  }

  return {
    data,
    patch,
    delete: del,
  }
}
