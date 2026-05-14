import { ChevronDown, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Role } from '@/features/auth/types'
import { cn } from '@/lib/utils'

export type MenuItem = {
  label: string
  path: string
}

export const MENU_BY_ROLE: Record<Role, MenuItem[]> = {
  ADMIN: [
    {
      label: 'Quản lý đợt phụ đạo',
      path: '/tutorial-periods',
    },
    {
      label: 'Quản lý người dùng',
      path: '/users',
    },
    {
      label: 'Báo cáo & thống kê',
      path: '/reports',
    },
    {
      label: 'Cài đặt hệ thống',
      path: '/settings',
    },
  ],
  DEPARTMENT: [
    {
      label: 'Xếp lịch phụ đạo',
      path: '/tutorial-scheduling',
    },
    {
      label: 'Phân công giảng viên',
      path: '/lecturer-assignments',
    },
  ],
  LECTURER: [
    {
      label: 'Lịch dạy',
      path: '/teaching-schedule',
    },
    {
      label: 'Thông tin cá nhân',
      path: '/profile',
    },
  ],
  STUDENT: [
    {
      label: 'Đăng ký phụ đạo',
      path: '/tutorial-registration',
    },
    {
      label: 'Lịch học',
      path: '/study-schedule',
    },
    {
      label: 'Thông tin cá nhân',
      path: '/profile',
    },
  ],
}

export const getMenuItemsForRole = (role?: Role | null): MenuItem[] => {
  if (!role) {
    return []
  }

  return MENU_BY_ROLE[role]
}

export const getDefaultMenuPathForRole = (role?: Role | null): string => {
  const [firstItem] = getMenuItemsForRole(role)

  return firstItem?.path ?? '/login'
}

interface AppMenuProps {
  role?: Role | null
  userName?: string
  onLogout?: () => void
  isLoggingOut?: boolean
}

export default function AppMenu({
  role,
  userName,
  onLogout,
  isLoggingOut = false,
}: AppMenuProps) {
  const items = getMenuItemsForRole(role)

  return (
    <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <nav
          aria-label="Admin navigation"
          className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0"
        >
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]/35',
                  isActive
                    ? 'bg-[#0f4c81] text-white shadow-[0_8px_24px_rgba(15,76,129,0.18)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
              Tài khoản
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {userName ?? 'Admin'}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-full border-slate-200 px-4 text-slate-700 hover:bg-slate-100"
              >
                <span className="max-w-36 truncate">
                  {userName ?? 'Admin'}
                </span>
                <ChevronDown className="size-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                  Người dùng hiện tại
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {userName ?? 'Admin'}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-600 focus:text-red-700"
              >
                <LogOut className="size-4" />
                {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
