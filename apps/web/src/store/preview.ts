import { state } from 'losen'
import { combineReducers, configureStore } from '@reduxjs/toolkit'

/**
 * Create the store with middleware
 */
const store = configureStore({
  reducer: combineReducers({
    [state.NAME]: state.reducer,
  }),
})

export default store
