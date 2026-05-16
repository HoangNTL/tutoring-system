import { useEffect, useRef } from 'react'

import { useAppDispatch } from '@/app/store/hooks'
import { checkAuth, clearAuth } from '@/features/auth/authSlice'
import { setUnauthorizedHandler } from '@/shared/api/http'

export const useAuthBootstrap = () => {
  const dispatch = useAppDispatch()
  const hasBootstrappedRef = useRef(false)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(clearAuth())
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [dispatch])

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    void dispatch(checkAuth())
  }, [dispatch])
}
