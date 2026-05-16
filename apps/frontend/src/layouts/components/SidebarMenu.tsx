import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import type { Role } from '@/features/auth/types'
import { getNavigationSectionsForRole } from '@/shared/config/navigation.config'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

interface SidebarMenuProps {
  role?: Role | null
  userName?: string
  onLogout?: () => void
  isLoggingOut?: boolean
}

const linkClassName = (isActive: boolean) =>
  cn(
    'flex w-full flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all duration-150',
    isActive
      ? 'border-[#0f4c81]/20 bg-[#0f4c81]/8 text-slate-950 shadow-sm'
      : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
  )

export default function SidebarMenu({
  role,
  userName,
  onLogout,
  isLoggingOut = false,
}: SidebarMenuProps) {
  const sections = getNavigationSectionsForRole(role)

  return (
    <aside className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
          Điều hướng
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-950">
          Khu vực quản trị
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Truy cập nhanh các nhóm chức năng chính.
        </p>
      </div>

      <nav aria-label="Sidebar navigation" className="mt-4 space-y-5">
        {sections.map((section) => (
          <section key={section.id} className="space-y-2">
            <div className="px-1">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                {section.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {section.description}
              </p>
            </div>

            <div className="space-y-1.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => linkClassName(isActive)}
                >
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-slate-500">
                    {item.description}
                  </span>
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Tài khoản
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-950">
          {userName ?? 'Người dùng'}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="mt-4 h-10 w-full justify-center rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </Button>
      </div>
    </aside>
  )
}
