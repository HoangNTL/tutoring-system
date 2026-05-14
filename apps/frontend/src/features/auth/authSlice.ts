import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from './types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isCheckingAuth: boolean
  hasCheckedAuth: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: false,
  hasCheckedAuth: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    startAuthCheck(state) {
      state.isCheckingAuth = true
    },

    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.isCheckingAuth = false
      state.hasCheckedAuth = true
    },

    setGuest(state) {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isCheckingAuth = false
      state.hasCheckedAuth = true
    },

    clearUser(state) {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isCheckingAuth = false
      state.hasCheckedAuth = true
    }
  }
})

export const { startAuthCheck, setUser, setGuest, clearUser } =
  authSlice.actions

export default authSlice.reducer
