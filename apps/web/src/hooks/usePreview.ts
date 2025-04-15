import { WizardDefinition } from 'losen'
import { useParams } from 'react-router'
import useSWR from 'swr'

export default function usePreview() {
  const { wizardId, versionId } = useParams()
  const { data, isLoading, mutate } = useSWR(
    `/api/wizard/${wizardId}/${versionId}/preview`,
    async (url: string) => (await (await fetch(url)).json()) as WizardDefinition,
  )

  return {
    loading: isLoading,
    data,
    reload: mutate,
  }
}
