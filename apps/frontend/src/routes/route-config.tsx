import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

import type { Role } from '@/features/auth/types'
import { getDefaultNavigationPathForRole } from '@/shared/config/navigation.config'

const TutorialPeriodListPage = lazy(
  () => import('@/features/tutorial-period/pages/TutorialPeriodListPage')
)
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'))
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))
const TutorialSchedulingPage = lazy(
  () => import('@/features/tutorial-scheduling/pages/TutorialSchedulingPage')
)
const DepartmentCourseRegistrationsPage = lazy(
  () =>
    import(
      '@/features/department-registration/pages/DepartmentCourseRegistrationsPage'
    )
)
const DepartmentTutorialClassesPage = lazy(
  () =>
    import(
      '@/features/department-classes/pages/DepartmentTutorialClassesPage'
    )
)
const LecturerAssignmentsPage = lazy(
  () => import('@/features/lecturer-assignments/pages/LecturerAssignmentsPage')
)
const TeachingSchedulePage = lazy(
  () => import('@/features/teaching-schedule/pages/TeachingSchedulePage')
)
const TutorialRegistrationPage = lazy(
  () => import('@/features/tutorial-registration/pages/TutorialRegistrationPage')
)
const TutorialRegistrationDetailPage = lazy(
  () => import('@/features/tutorial-registration/pages/TutorialRegistrationDetailPage')
)
const StudySchedulePage = lazy(
  () => import('@/features/study-schedule/pages/StudySchedulePage')
)
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
export const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))

export type AppRouteDefinition = {
  path: string
  allowedRoles: Role[]
  component: LazyExoticComponent<ComponentType>
}

export const appRoutes: AppRouteDefinition[] = [
  {
    path: '/tutorial-periods',
    allowedRoles: ['ADMIN'],
    component: TutorialPeriodListPage,
  },
  {
    path: '/users',
    allowedRoles: ['ADMIN'],
    component: UsersPage,
  },
  {
    path: '/reports',
    allowedRoles: ['ADMIN'],
    component: ReportsPage,
  },
  {
    path: '/settings',
    allowedRoles: ['ADMIN'],
    component: SettingsPage,
  },
  {
    path: '/department-course-registrations',
    allowedRoles: ['DEPARTMENT'],
    component: DepartmentCourseRegistrationsPage,
  },
  {
    path: '/department-tutorial-classes',
    allowedRoles: ['DEPARTMENT'],
    component: DepartmentTutorialClassesPage,
  },
  {
    path: '/tutorial-scheduling',
    allowedRoles: ['DEPARTMENT'],
    component: TutorialSchedulingPage,
  },
  {
    path: '/lecturer-assignments',
    allowedRoles: ['DEPARTMENT'],
    component: LecturerAssignmentsPage,
  },
  {
    path: '/teaching-schedule',
    allowedRoles: ['LECTURER'],
    component: TeachingSchedulePage,
  },
  {
    path: '/profile',
    allowedRoles: ['LECTURER', 'STUDENT'],
    component: ProfilePage,
  },
  {
    path: '/tutorial-registration',
    allowedRoles: ['STUDENT'],
    component: TutorialRegistrationPage,
  },
  {
    path: '/tutorial-registration/:tutorialPeriodId',
    allowedRoles: ['STUDENT'],
    component: TutorialRegistrationDetailPage,
  },
  {
    path: '/study-schedule',
    allowedRoles: ['STUDENT'],
    component: StudySchedulePage,
  },
]

export const getDefaultRouteForRole = (role?: Role | null) => {
  return getDefaultNavigationPathForRole(role)
}
