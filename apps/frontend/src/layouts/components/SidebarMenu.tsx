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
    'flex w-full items-center rounded-lg border px-2.5 py-2 text-left text-sm font-medium transition-all duration-150',
    isActive
      ? 'border-slate-200 bg-slate-100 text-slate-950 shadow-sm'
      : 'border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950'
  )

export default function SidebarMenu({
  role,
  userName,
  onLogout,
  isLoggingOut = false,
}: SidebarMenuProps) {
  const sections = getNavigationSectionsForRole(role)

  return (
    <aside className="flex h-full min-h-full w-full flex-col justify-between px-1 py-1 lg:w-60">
      <nav aria-label="Sidebar navigation" className="space-y-3">
        {sections.map((section) => (
          <section key={section.id} className="space-y-1">
            <div className="px-1 pb-1">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                {section.title}
              </p>
            </div>

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => linkClassName(isActive)}
                >
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="mt-4 border-t border-slate-200 pt-3">
        <p className="truncate px-1 text-sm font-medium text-slate-800">
          {userName ?? 'Người dùng'}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="mt-2 h-8 w-full justify-center rounded-lg border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </Button>
      </div>
    </aside>
  )
}
