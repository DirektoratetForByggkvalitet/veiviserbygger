import { getWizardsRef, getWizardVersionRef, getWizardVersionsRef } from '@/services/firebase'
import { doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import useFirebase from './useFirebase'
import { Wizard, WizardVersion, WrappedWithId } from 'types'
import { sortVersions } from '@/lib/versions'

export default function useWizard(id?: string, version?: string) {
  const { firestore } = useFirebase()

  const [wizard, setWizard] = useState<WrappedWithId<Wizard>>()
  const [wizardVersions, setWizardVersions] =
    useState<{ id: string; title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp }[]>()
  const [wizardVersionData, setWizardVersionData] = useState<WizardVersion>()

  console.log('||', wizard)

  useEffect(() => {
    const unsubWizardVersions = id
      ? onSnapshot(getWizardVersionsRef(firestore, id), (snapshot) => {
          setWizardVersions(
            sortVersions(
              snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
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
