import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'

import { getCurrentUserApi } from '@/features/auth/api'
import type { User } from '@/features/auth/types'

export type AuthStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: User | null
}

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUserApi()

      return response.data.user
    } catch {
      return rejectWithValue('Unauthenticated')
    }
  }
)

const initialState: AuthState = {
  status: 'checking',
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser(state, action: PayloadAction<User>) {
      state.status = 'authenticated'
      state.user = action.payload
    },
    clearAuth(state) {
      state.status = 'unauthenticated'
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.status = 'checking'
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, (state) => {
        state.status = 'unauthenticated'
        state.user = null
      })
  },
})

export const { setAuthUser, clearAuth } = authSlice.actions

export default authSlice.reducer
