import type { BaseResponse } from '@/shared/types/api'

export type Role = 'ADMIN' | 'DEPARTMENT' | 'LECTURER' | 'STUDENT'

export interface User {
  id: number
  username: string
  role: Role
  studentId?: number | null
  lecturerId?: number | null
  departmentId?: number | null
  departmentName?: string | null
  lecturerName?: string | null
  studentName?: string | null
  createdAt?: string | null
}

export interface LoginPayload {
  username: string
  password: string
}

export type LoginResponse = BaseResponse<{
  user: User
}>
