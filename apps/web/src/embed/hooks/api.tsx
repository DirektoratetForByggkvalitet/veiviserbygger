import { WizardDefinition } from 'losen'
import { useEffect, useState } from 'react'
import { WizardIntro } from 'types'

type PreviewError = Error & {
  info: any
  status: number
}

export function useApi(host: string, wizardId: string) {
  const [data, setData] = useState<WizardDefinition & { intro?: WizardIntro }>()
  const [error, setError] = useState<PreviewError | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    fetch(`${host}/api/wizard/${wizardId}`)
      .then(async (res) => {
        if (!res.ok) {
          const error = new Error('An error occurred while fetching the data.') as PreviewError
          error.info = await res.json()
          error.status = res.status
          setError(error)
          setIsLoading(false)
          return
        }

        const result = (await res.json()) as typeof data
        setData(result)
        setIsLoading(false)
      })
      .catch((err) => {
        const error = new Error('An error occurred while fetching the data.') as PreviewError
        error.info = err
        error.status = 500
        setError(error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [host, wizardId])

  return {
    loading: isLoading,
    data,
    error,
  }
}
