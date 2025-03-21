import {
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
import { curry } from 'lodash'

export default function useWizard(id?: string, version?: string) {
  const { firestore } = useFirebase()

  const [wizard, setWizard] = useState<WrappedWithId<Wizard>>()
  const [wizardVersions, setWizardVersions] =
    useState<{ id: string; title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp }[]>()
  const [nodes, setNodes] = useState<Record<string, OptionalExcept<PageContent, 'type' | 'id'>>>({})
  const [wizardVersionData, setWizardVersionData] = useState<WizardVersion>()

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
        })
      : undefined

    return () => {
      unsubWizardVersions?.()
    }
  }, [id])

  useEffect(() => {
    const unsubWizard = id
      ? onSnapshot(doc(getWizardsRef(firestore), id), (snapshot) => {
          if (!snapshot.exists()) {
            return
          }

          setWizard({
            id: snapshot.id,
            data: snapshot.data(),
          })
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
            },
          )
        : undefined

    return () => {
      unsubVersion?.()
    }
  }, [id, version])

  return {
    wizard,
    versions: wizardVersions,
    version: wizardVersionData,
    patch: curry(patchWizard)({ db: firestore, wizardId: id || '', versionId: version || '' }),
    nodes,
  }
}
