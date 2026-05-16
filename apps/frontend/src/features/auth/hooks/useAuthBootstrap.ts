import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { getCurrentUserApi } from '@/features/auth/api'
import {
  setAuthUser,
  setGuest,
  startAuthCheck,
} from '@/features/auth/authSlice'

export const useAuthBootstrap = () => {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    if (authStatus !== 'idle') {
      return
    }

    let isMounted = true

    const bootstrapAuth = async () => {
      dispatch(startAuthCheck())

      try {
        const response = await getCurrentUserApi()

        if (!isMounted) {
          return
        }

        dispatch(setAuthUser(response.data.user))
      } catch {
        if (!isMounted) {
          return
        }

        dispatch(setGuest())
      }
    }

    void bootstrapAuth()

    return () => {
      isMounted = false
    }
  }, [authStatus, dispatch])
}
