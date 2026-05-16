import http from '@/shared/api/http'
import { AUTH_API_ENDPOINTS } from '@/features/auth/constants'
import type { LoginPayload, LoginResponse, User } from '@/features/auth/types'
import type { BaseResponse } from '@/shared/types/api'

export const getCsrfCookie = async () => {
  await http.get(AUTH_API_ENDPOINTS.csrfCookie)
}

export const loginApi = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  await getCsrfCookie()

  const response = await http.post<LoginResponse>(AUTH_API_ENDPOINTS.login, {
    username: payload.username.trim(),
    password: payload.password,
  })

  if (!response.data.success || !response.data.data?.user) {
    throw new Error(response.data.message || 'Đăng nhập thất bại.')
  }

  return response.data
}

export const logoutApi = async (): Promise<BaseResponse<null>> => {
  await getCsrfCookie()

  const response = await http.post<BaseResponse<null>>(
    AUTH_API_ENDPOINTS.logout,
    undefined
  )

  return response.data
}

export const getCurrentUserApi = async (): Promise<
  BaseResponse<{ user: User }>
> => {
  const response = await http.get<BaseResponse<{ user: User }>>(
    AUTH_API_ENDPOINTS.me
  )

  return response.data
}
