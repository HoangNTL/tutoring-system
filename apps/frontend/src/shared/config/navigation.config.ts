import { hasRequiredRole } from '@/features/auth/rbac'
import type { Role } from '@/features/auth/types'

export type LayoutId = 'admin' | 'lecturer' | 'student'

export type NavigationLinkItem = {
  title: string
  description: string
  path: string
  allowedRoles: Role[]
}

export type NavigationSection = {
  id: string
  title: string
  description: string
  items: NavigationLinkItem[]
}

export type TopNavigationItem =
  | {
      type: 'link'
      title: string
      description: string
      item: NavigationLinkItem
    }
  | {
      type: 'group'
      title: string
      description: string
      items: NavigationLinkItem[]
    }

export const layoutByRole: Record<Role, LayoutId> = {
  ADMIN: 'admin',
  DEPARTMENT: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
}

export const navigationConfig: NavigationSection[] = [
  {
    id: 'management',
    title: 'Quản trị',
    description: 'Công cụ vận hành và cấu hình.',
    items: [
      {
        title: 'Người dùng',
        description: 'Quản lý tài khoản và quyền.',
        path: '/users',
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Cài đặt',
        description: 'Điều chỉnh cấu hình chính.',
        path: '/settings',
        allowedRoles: ['ADMIN'],
      },
    ],
  },
  {
    id: 'tutorial',
    title: 'Phụ đạo',
    description: 'Nghiệp vụ chính của hệ thống.',
    items: [
      {
        title: 'Đợt học',
        description: 'Quản lý các đợt phụ đạo.',
        path: '/tutorial-periods',
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Môn học đăng ký',
        description: 'Xem nhu cầu đăng ký theo môn học.',
        path: '/department-course-registrations',
        allowedRoles: ['DEPARTMENT'],
      },
      {
        title: 'Xếp lịch',
        description: 'Thiết lập lịch phụ đạo.',
        path: '/tutorial-scheduling',
        allowedRoles: ['DEPARTMENT'],
      },
      {
        title: 'Giảng viên',
        description: 'Phân công giảng viên.',
        path: '/lecturer-assignments',
        allowedRoles: ['DEPARTMENT'],
      },
      {
        title: 'Đăng ký phụ đạo',
        description: 'Đăng ký lớp phụ đạo.',
        path: '/tutorial-registration',
        allowedRoles: ['STUDENT'],
      },
    ],
  },
  {
    id: 'schedule',
    title: 'Lịch biểu',
    description: 'Theo dõi lịch theo vai trò.',
    items: [
      {
        title: 'Lịch dạy',
        description: 'Xem lịch dạy hiện tại.',
        path: '/teaching-schedule',
        allowedRoles: ['LECTURER'],
      },
      {
        title: 'Lịch học',
        description: 'Xem lịch học hiện tại.',
        path: '/study-schedule',
        allowedRoles: ['STUDENT'],
      },
    ],
  },
  {
    id: 'insights',
    title: 'Tổng quan',
    description: 'Báo cáo và thông tin cá nhân.',
    items: [
      {
        title: 'Báo cáo',
        description: 'Xem thống kê vận hành.',
        path: '/reports',
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Hồ sơ',
        description: 'Xem thông tin cá nhân.',
        path: '/profile',
        allowedRoles: ['LECTURER', 'STUDENT'],
      },
    ],
  },
]

const getVisibleLinks = (
  items: NavigationLinkItem[],
  role?: Role | null
) => items.filter((item) => hasRequiredRole(role, item.allowedRoles))

export const getLayoutForRole = (role?: Role | null): LayoutId | null => {
  if (!role) {
    return null
  }

  return layoutByRole[role]
}

export const getNavigationSectionsForRole = (role?: Role | null) =>
  navigationConfig
    .map((section) => {
      const visibleItems = getVisibleLinks(section.items, role)

      if (visibleItems.length === 0) {
        return null
      }

      return {
        ...section,
        items: visibleItems,
      }
    })
    .filter((section): section is NavigationSection => section !== null)

export const getTopNavigationItemsForRole = (
  role?: Role | null
): TopNavigationItem[] =>
  getNavigationSectionsForRole(role).map((section) => {
    if (section.items.length === 1) {
      return {
        type: 'link',
        title: section.items[0].title,
        description: section.items[0].description,
        item: section.items[0],
      }
    }

    return {
      type: 'group',
      title: section.title,
      description: section.description,
      items: section.items,
    }
  })

export const getDefaultNavigationPathForRole = (role?: Role | null) => {
  for (const section of getNavigationSectionsForRole(role)) {
    const firstVisibleItem = section.items[0]

    if (firstVisibleItem) {
      return firstVisibleItem.path
    }
  }

  return '/login'
}
