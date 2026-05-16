import type { BaseResponse } from '@/shared/types/api'

export type Role = 'ADMIN' | 'DEPARTMENT' | 'LECTURER' | 'STUDENT'

export interface User {
  id: number
  username: string
  role: Role
}

export interface LoginPayload {
  username: string
  password: string
}

export type LoginResponse = BaseResponse<{
  user: User
}>
