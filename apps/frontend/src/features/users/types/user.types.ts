export const userRoles = ['ADMIN', 'DEPARTMENT', 'LECTURER', 'STUDENT'] as const

export type UserRole = (typeof userRoles)[number]

export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  DEPARTMENT: 'Bộ môn',
  LECTURER: 'Giảng viên',
  STUDENT: 'Sinh viên',
}

export type UserListItem = {
  id: number
  username: string
  role: UserRole
  studentId: number | null
  lecturerId: number | null
  departmentId: number | null
  createdAt: string | null
}

export type UserListParams = {
  page: number
  limit: number
  search: string
  role: UserRole | 'ALL'
}
