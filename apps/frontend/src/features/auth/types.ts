import type { BaseResponse } from '@/types/common'

export type Role = 'ADMIN' | 'DEPARTMENT' | 'LECTURER' | 'STUDENT'

export interface User {
  id: number
  username: string
  role: Role
}

export interface LoginPayload {
  username: string
  password: string
  // remember?: boolean;
}

export type LoginResponse = BaseResponse<{
  user: User
}>
