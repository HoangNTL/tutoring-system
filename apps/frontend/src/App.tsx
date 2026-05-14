import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'

import LoadingOverlay from '@/components/loading/LoadingOverlay'
import { setGuest, setUser, startAuthCheck } from '@/features/auth/authSlice'
import { getStoredAuthUser } from '@/features/auth/storage'
import AppRouter from '@/routes/AppRouter'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

function AppContent() {
  const dispatch = useAppDispatch()
  const { hasCheckedAuth, isCheckingAuth } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (hasCheckedAuth || isCheckingAuth) {
      return
    }

    dispatch(startAuthCheck())

    const storedUser = getStoredAuthUser()

    if (storedUser) {
      dispatch(setUser(storedUser))
      return
    }

    dispatch(setGuest())
  }, [dispatch, hasCheckedAuth, isCheckingAuth])

  return (
    <>
      <LoadingOverlay />
      <AppRouter />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
