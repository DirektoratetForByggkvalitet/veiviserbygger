// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { PureComponent, ReactNode, useEffect, useState } from 'react'
import { Persistor } from 'redux-persist'

type Props = {
  onBeforeLift?: () => void
  children?: ReactNode | ((state: boolean) => ReactNode)
  loading?: ReactNode
  persistor: Persistor
}

export function PersistGate({ children = null, loading = null, persistor, onBeforeLift }: Props) {
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    const unsubscribe = persistor.subscribe(handlePersistorState)
    return unsubscribe
  }, [persistor])

  const handlePersistorState = () => {
    const bootstrapped = persistor.getState().bootstrapped

    if (!bootstrapped) {
      return
    }

    if (!onBeforeLift) {
      return setBootstrapped(true)
    }

    Promise.resolve(onBeforeLift()).finally(() => setBootstrapped(true))
  }

  if (process.env.NODE_ENV !== 'production') {
    if (typeof children === 'function' && loading)
      console.error(
        'redux-persist: PersistGate expects either a function child or loading prop, but not both. The loading prop will be ignored.',
      )
  }
  if (typeof children === 'function') {
    return children(bootstrapped)
  }

  return bootstrapped ? children : loading
}
