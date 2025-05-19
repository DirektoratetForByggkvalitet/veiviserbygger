import {
  deleteVersion,
  deleteWizard,
  getNodesRef,
  getWizardsRef,
  getWizardVersionRef,
  getWizardVersionsRef,
  patchWizard,
} from '@/services/firebase'
import { doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import useFirebase from './useFirebase'
import { OptionalExcept, PageContent, Wizard, WizardVersion, WrappedWithId } from 'types'
import { sortVersions } from '@/lib/versions'
import { curry, values } from 'lodash'

export default function useWizard(id?: string, version?: string) {
  const { firestore } = useFirebase()

  const [loading, setLoading] = useState({
    wizard: true,
    versions: true,
    version: true,
    nodes: true,
  })
  const [wizard, setWizard] = useState<WrappedWithId<Wizard>>()
  const [wizardVersions, setWizardVersions] =
    useState<{ id: string; title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp }[]>()
  const [nodes, setNodes] = useState<Record<string, OptionalExcept<PageContent, 'type' | 'id'>>>({})
  const [wizardVersionData, setWizardVersionData] = useState<WizardVersion>()

  const setLoadingState = (key: keyof typeof loading, value: boolean) => {
    setLoading((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  useEffect(() => {
    const unsubNodes =
      id && version
        ? onSnapshot(
            getNodesRef({ db: firestore, wizardId: id, versionId: version }),
            (snapshot) => {
              setNodes(
                snapshot.docs.reduce(
                  (res, doc) => ({
                    ...res,
                    [doc.id]: doc.data(),
                  }),
                  {},
                ),
              )

              setLoadingState('nodes', false)
            },
          )
        : undefined

    return () => {
      unsubNodes?.()
    }
  }, [id, version])

  useEffect(() => {
    const unsubWizardVersions = id
      ? onSnapshot(getWizardVersionsRef(firestore, id), (snapshot) => {
          setWizardVersions(
            sortVersions(
              snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
              })),
            ),
          )

          setLoadingState('versions', false)
        })
      : undefined

    return () => {
      unsubWizardVersions?.()
    }
  }, [id])

  useEffect(() => {
    const unsubWizard = id
      ? onSnapshot(doc(getWizardsRef(firestore), id), (snapshot) => {
          if (snapshot.exists()) {
            setWizard({
              id: snapshot.id,
              data: snapshot.data(),
            })
          }

          setLoadingState('wizard', false)
        })
      : undefined

    return () => {
      unsubWizard?.()
    }
  }, [id])

  useEffect(() => {
    const unsubVersion =
      id && version
        ? onSnapshot(
            getWizardVersionRef({ db: firestore, wizardId: id, versionId: version }),
            (snapshot) => {
              setWizardVersionData(snapshot.data())
              setLoadingState('version', false)
            },
          )
        : undefined

    return () => {
      unsubVersion?.()
    }
  }, [id, version])

  return {
    loading: values(loading).some(Boolean),
    wizard,
    versions: wizardVersions,
    version: wizardVersionData,
    patchWizard: curry(patchWizard)({
      db: firestore,
      wizardId: id || '',
      versionId: version || '',
    }),
    deleteWizard: () =>
      deleteWizard({
        db: firestore,
        wizardId: id || '',
        versionId: version || '',
      }),
    deleteVersion: (versionId: string) =>
      deleteVersion({
        db: firestore,
        wizardId: id || '',
        versionId,
      }),
    nodes,
  }
}
