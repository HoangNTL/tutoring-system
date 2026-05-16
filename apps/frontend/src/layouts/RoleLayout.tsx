import { Navigate } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'
import AdminLayout from '@/layouts/AdminLayout'
import LecturerLayout from '@/layouts/LecturerLayout'
import StudentLayout from '@/layouts/StudentLayout'
import { getLayoutForRole } from '@/shared/config/navigation.config'

export default function RoleLayout() {
  const role = useAppSelector((state) => state.auth.user?.role)
  const layout = getLayoutForRole(role)

  if (!layout) {
    return <Navigate to="/login" replace />
  }

  if (layout === 'admin') {
    return <AdminLayout />
  }

  if (layout === 'lecturer') {
    return <LecturerLayout />
  }

  return <StudentLayout />
}
