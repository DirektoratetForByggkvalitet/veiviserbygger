import { getWizardsRef } from '@/services/firebase'
import { onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import useFirebase from './useFirebase'
import { Wizard, WrappedWithId } from 'types'

export default function useWizards(open: boolean) {
  const { firestore } = useFirebase()
  const [wizards, setWizards] = useState<WrappedWithId<Wizard>[]>()

  useEffect(() => {
    if (!open && !wizards) {
      return
    }

    const wizardsRef = getWizardsRef(firestore)

    const unsubWizards = onSnapshot(wizardsRef, (snapshot) => {
      setWizards(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        })),
      )
    })

    return () => {
      unsubWizards()
    }
  }, [open])

  return {
    wizards,
  }
}
