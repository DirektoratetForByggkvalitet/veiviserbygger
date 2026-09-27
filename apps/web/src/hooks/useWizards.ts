import { getWizardsRef } from '@/services/firebase'
import { FirestoreError, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import useFirebase from './useFirebase'
import { Wizard, WrappedWithId } from 'types'

export default function useWizards(open: boolean) {
  const { firestore } = useFirebase()
  const [wizards, setWizards] = useState<WrappedWithId<Wizard>[]>()
  const [error, setError] = useState<FirestoreError>()

  useEffect(() => {
    if (!open && !wizards) {
      return
    }

    const wizardsRef = getWizardsRef(firestore)

    const unsubWizards = onSnapshot(
      wizardsRef,
      (snapshot) => {
        setError(undefined)
        setWizards(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          })),
        )
      },
      (err) => {
        console.error('Failed to load wizards', err)
        setError(err)
      },
    )

    return () => {
      unsubWizards()
    }
  }, [open])

  return {
    wizards,
    error,
  }
}
