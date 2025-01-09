import { getWizardVersionRef, getWizardVersionsRef } from '@/services/firebase'
import { WizardVersion, WrappedWithId } from '@/services/firebase/types'
import { onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import useFirebase from './useFirebase'

export default function useWizard(id?: string, version?: string) {
  const { firestore } = useFirebase()

  const [wizardVersions, setWizardVersions] = useState<WrappedWithId<WizardVersion>[]>()
  const [wizardVersionData, setWizardVersionData] = useState<WizardVersion>()

  useEffect(() => {
    const unsubWizardVersions = id
      ? onSnapshot(getWizardVersionsRef(firestore, id), (snapshot) => {
          setWizardVersions(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              data: doc.data(),
            })),
          )
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
    versions: wizardVersions,
    activeVersion: wizardVersionData,
  }
}
