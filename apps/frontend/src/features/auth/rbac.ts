import type { Role } from '@/features/auth/types'

export const allRoles: Role[] = [
  'ADMIN',
  'DEPARTMENT',
  'LECTURER',
  'STUDENT',
]

export const hasRequiredRole = (
  role: Role | null | undefined,
  allowedRoles?: Role[]
) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true
  }

  if (!role) {
    return false
  }

  return allowedRoles.includes(role)
}
