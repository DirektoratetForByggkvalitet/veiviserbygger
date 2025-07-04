import { WizardDefinition } from 'losen'
import { useParams } from 'react-router'
import useSWR from 'swr'

type PreviewResult = WizardDefinition
type PreviewError = Error & {
  info: any
  status: number
}

export default function usePreview() {
  const { wizardId, versionId } = useParams()
  const { data, error, isLoading, mutate } = useSWR<PreviewResult, PreviewError>(
    `/api/wizard/${wizardId}/${versionId}/preview`,
    async (url: string) => {
      const res = await fetch(url)

      if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.') as PreviewError

        // Attach extra info to the error object.
        error.info = await res.json()
        error.status = res.status
        throw error
      }

      return (await res.json()) as PreviewResult
    },
    {
      refreshInterval: 5000,
    },
  )

  return {
    loading: isLoading,
    data,
    error,
    reload: mutate,
  }
}
