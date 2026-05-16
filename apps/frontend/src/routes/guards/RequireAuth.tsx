import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'
import PageLoader from '@/shared/ui/loading/page-loader'

export default function RequireAuth() {
  const { status, user } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (status === 'checking') {
    return <PageLoader label="Đang kiểm tra phiên đăng nhập..." />
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
