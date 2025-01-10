import { getWizardsRef, getWizardVersionRef, getWizardVersionsRef } from '@/services/firebase'
import { doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import useFirebase from './useFirebase'
import { Wizard, WizardVersion, WrappedWithId } from 'types'

export default function useWizard(id?: string, version?: string) {
  const { firestore } = useFirebase()

  const [wizard, setWizard] = useState<WrappedWithId<Wizard | undefined>>()
  const [wizardVersions, setWizardVersions] =
    useState<{ id: string; publishedFrom?: Date; publishedTo?: Date }[]>()
  const [wizardVersionData, setWizardVersionData] = useState<WizardVersion>()

  useEffect(() => {
    const unsubWizardVersions = id
      ? onSnapshot(getWizardVersionsRef(firestore, id), (snapshot) => {
          setWizardVersions(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              publishedFrom: (doc.data().publishedFrom as Timestamp)?.toDate(),
              publishedTo: (doc.data().publishedTo as Timestamp)?.toDate(),
            })),
          )
        })
      : undefined

    return () => {
      unsubWizardVersions?.()
    }
  }, [id])

  useEffect(() => {
    const unsubWizardVersions = id
      ? onSnapshot(doc(getWizardsRef(firestore), id), (snapshot) => {
          setWizard({
            id: snapshot.id,
            data: snapshot.data(),
          })
        })
      : undefined

    return () => {
      unsubWizardVersions?.()
    }
  }, [id])

  useEffect(() => {
    const unsubVersion =
      id && version
        ? onSnapshot(getWizardVersionRef(firestore, id, version), (snapshot) => {
            setWizardVersionData(snapshot.data())
          })
        : undefined

    return () => {
      unsubVersion?.()
    }
  }, [id, version])

  return {
    wizard,
    versions: wizardVersions,
    version: wizardVersionData,
  }
}
