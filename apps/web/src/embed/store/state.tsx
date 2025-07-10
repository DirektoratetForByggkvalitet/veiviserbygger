/* globals window */

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: typeof compose
  }
}

import { createStore, combineReducers, compose } from 'redux'
import { state, WizardDefinition } from 'losen'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

export default function getStore(schema: WizardDefinition) {
  const persistConfig = {
    key: schema.meta.localStorageKey || schema.meta.name || 'root',
    storage,
  }

  const persistedReducer = persistReducer(
    persistConfig,
    combineReducers({ [state.NAME]: state.reducer(schema) }),
  )

  /**
   * Create the store with middleware
   */
  const store = createStore(
    persistedReducer,
    undefined,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  )

  return {
    store,
    persistor: persistStore(store),
  }
}
