import { state, WizardDefinition } from 'losen'
import { combineReducers, configureStore } from '@reduxjs/toolkit'

/**
 * Create the store with middleware
 */
export const getStore = (wizardDef: WizardDefinition) =>
  configureStore({
    preloadedState: {},
    reducer: combineReducers({
      [state.NAME]: state.reducer(wizardDef),
    }),
  })
