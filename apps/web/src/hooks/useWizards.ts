import { getWizardsRef, getWizardVersionRef } from '@/services/firebase'
import { Wizard, WizardVersion, WrappedWithId } from '@/services/firebase/types'
import { onSnapshot } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import useFirebase from './useFirebase'

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
