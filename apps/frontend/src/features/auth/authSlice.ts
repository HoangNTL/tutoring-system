import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { User } from '@/features/auth/types'

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'guest'

interface AuthState {
  status: AuthStatus
  user: User | null
}

const initialState: AuthState = {
  status: 'idle',
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startAuthCheck(state) {
      state.status = 'checking'
    },
    setAuthUser(state, action: PayloadAction<User>) {
      state.status = 'authenticated'
      state.user = action.payload
    },
    setGuest(state) {
      state.status = 'guest'
      state.user = null
    },
    clearAuth(state) {
      state.status = 'guest'
      state.user = null
    },
  },
})

export const { startAuthCheck, setAuthUser, setGuest, clearAuth } =
  authSlice.actions

export default authSlice.reducer
