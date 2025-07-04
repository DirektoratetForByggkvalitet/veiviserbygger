type Props = {
  wizardId: string
  host: string
}

import { getStore } from '@/store/preview'
import { useApi } from './hooks/api'
import { Wizard } from 'losen'
import { Provider } from 'react-redux'

export function EmbedApp({ wizardId, host }: Props) {
  const { loading, data, error } = useApi(host, wizardId)

  if (loading) {
    return null
  }

  if (error?.status === 404) {
    return (
      <div>
        <h1>Fant ikke veiviseren</h1>
      </div>
    )
  }

  if (!data) {
    return <div>Ingen data</div>
  }

  return (
    <Provider store={getStore(data)}>
      <Wizard wizard={data} />
    </Provider>
  )
}
