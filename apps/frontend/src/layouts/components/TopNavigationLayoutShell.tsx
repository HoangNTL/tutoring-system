import type { PropsWithChildren } from 'react'
import { LogOut } from 'lucide-react'

import type { Role } from '@/features/auth/types'
import AppMenu from '@/layouts/components/AppMenu'
import Footer from '@/layouts/components/Footer'
import Header from '@/layouts/components/Header'
import { Button } from '@/shared/ui/button'

interface TopNavigationLayoutShellProps extends PropsWithChildren {
  role?: Role | null
  userName?: string
  title: string
  description: string
  showPageIntro?: boolean
  onLogout?: () => void
  isLoggingOut?: boolean
}

export default function TopNavigationLayoutShell({
  role,
  userName,
  title,
  description,
  showPageIntro = true,
  onLogout,
  isLoggingOut = false,
  children,
}: TopNavigationLayoutShellProps) {
  const accountLabel = role === 'STUDENT' ? 'MSSV' : 'Tài khoản'

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_28%,#f8fafc_100%)] text-slate-900">
      <Header />

      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <AppMenu role={role} />

          <div className="flex items-center gap-3 text-sm text-slate-700">
            <p className="whitespace-nowrap">
              <span className="text-slate-500">{accountLabel}:</span>{' '}
              <span className="font-semibold text-slate-900">
                {userName ?? 'Người dùng'}
              </span>
            </p>

            <Button
              type="button"
              variant="ghost"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="h-9 rounded-md px-3 text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="size-4" />
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {showPageIntro ? (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white/75 px-6 py-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        ) : null}

        {children}
      </main>

      <Footer />
    </div>
  )
}
