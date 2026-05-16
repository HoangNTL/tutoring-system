import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'
import PageLoader from '@/shared/ui/loading/page-loader'
import { getDefaultRouteForRole } from '@/routes/route-config'

type GuestOnlyRouteProps = {
  children: ReactNode
}

export default function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { status, user } = useAppSelector((state) => state.auth)

  if (status === 'idle' || status === 'checking') {
    return <PageLoader label="Đang kiểm tra phiên đăng nhập..." />
  }

  if (status === 'authenticated' && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <>{children}</>
}
