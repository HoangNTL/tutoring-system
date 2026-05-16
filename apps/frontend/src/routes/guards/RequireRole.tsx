import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'
import { hasRequiredRole } from '@/features/auth/rbac'
import type { Role } from '@/features/auth/types'
import { getDefaultRouteForRole } from '@/routes/route-config'

type RequireRoleProps = {
  allowedRoles: Role[]
  children: ReactNode
}

export default function RequireRole({
  allowedRoles,
  children,
}: RequireRoleProps) {
  const role = useAppSelector((state) => state.auth.user?.role)

  if (!hasRequiredRole(role, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />
  }

  return <>{children}</>
}
