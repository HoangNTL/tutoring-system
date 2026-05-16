import { Outlet, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation'
import TopNavigationLayoutShell from '@/layouts/components/TopNavigationLayoutShell'

export default function StudentLayout() {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const logoutMutation = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <TopNavigationLayoutShell
      role={user?.role}
      userName={user?.username}
      title="Không gian sinh viên"
      description="Giữ điều hướng đơn giản để sinh viên tập trung vào đăng ký phụ đạo, lịch học và thông tin cá nhân."
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    >
      <Outlet />
    </TopNavigationLayoutShell>
  )
}
