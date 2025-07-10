type Props = {
  wizardId: string
  host: string
}

import { Wizard } from 'losen'
import { Provider } from 'react-redux'
import Intro from '@/components/Intro'
import { useApi } from './hooks/api'
import { PersistGate } from '@/components/PersistGate'
import { useMemo } from 'react'
import getStore from './store/state'

export function EmbedApp({ wizardId, host }: Props) {
  const { loading, data, error } = useApi(host, wizardId)
  const store = useMemo(() => data && getStore(data), [data])

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

  if (!data || !store) {
    return <div>Ingen data</div>
  }

  return (
    <Provider store={store.store}>
      <PersistGate persistor={store.persistor}>
        <Intro
          wizard={data}
          render={({ toggleIntro }) => <Wizard wizard={data} showIntro={toggleIntro(true)} />}
        />
      </PersistGate>
    </Provider>
  )
}
