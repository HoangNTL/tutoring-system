import { createSlice } from '@reduxjs/toolkit'

type LoadingState = {
  activeRequests: number
}

const initialState: LoadingState = {
  activeRequests: 0
}

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    requestStarted: (state) => {
      state.activeRequests += 1
    },
    requestFinished: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1)
    },
    resetLoading: (state) => {
      state.activeRequests = 0
    }
  }
})

export const { requestStarted, requestFinished, resetLoading } =
  loadingSlice.actions

export default loadingSlice.reducer
