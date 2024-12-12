import { getWizardVersionRef } from '@/services/firebase'
import { WizardVersion } from '@/services/firebase/types'
import { onSnapshot } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

export default function useWizard(id: string, version: string) {
  const wizardRef = useMemo(() => getWizardVersionRef(id, version), [id, version])
  const [wizardVersionData, setWizardVersionData] = useState<WizardVersion>()

  useEffect(() => {
    const unsubWizardVersion = onSnapshot(wizardRef, (snapshot) => {
      setWizardVersionData(snapshot.data())
    })

    return () => {
      unsubWizardVersion()
    }
  }, [wizardRef])

  return {
    wizardVersion: wizardVersionData,
  }
}
