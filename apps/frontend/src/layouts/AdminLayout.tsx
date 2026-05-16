import { Outlet, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation'
import Footer from '@/layouts/components/Footer'
import Header from '@/layouts/components/Header'
import SidebarMenu from '@/layouts/components/SidebarMenu'

export default function AdminLayout() {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const logoutMutation = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_30%,#f8fafc_100%)] text-slate-900">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:px-8">
        <div className="shrink-0 lg:sticky lg:top-6">
          <SidebarMenu
            role={user?.role}
            userName={user?.username}
            onLogout={handleLogout}
            isLoggingOut={logoutMutation.isPending}
          />
        </div>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}
