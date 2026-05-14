import type { PropsWithChildren } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { logoutApi } from '@/api/auth.api'
import axiosInstance from '@/api/axiosInstance'
import AppMenu from '@/components/layout/AppMenu'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { clearUser } from '@/features/auth/authSlice'
import { clearStoredAuthUser } from '@/features/auth/storage'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

type MainLayoutProps = PropsWithChildren<{
  showFooter?: boolean
}>

export default function MainLayout({
  children,
  showFooter = true,
}: MainLayoutProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userName = useAppSelector((state) => state.auth.user?.username)
  const userRole = useAppSelector((state) => state.auth.user?.role)

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
  })

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      clearStoredAuthUser()
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('token')
      delete axiosInstance.defaults.headers.common.Authorization
      queryClient.clear()
      dispatch(clearUser())
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_28%,#f8fafc_100%)] text-slate-900">
      <Header />
      <AppMenu
        role={userRole}
        userName={userName}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
      />
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  )
}
