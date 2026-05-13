import axiosInstance from './axiosInstance'
import { API_ENDPOINTS } from '@/constants/api'
import type { LoginPayload, LoginResponse, User } from '@/features/auth/types'
import type { BaseResponse } from '@/types/common'

export const getCsrfCookie = async () => {
  await axiosInstance.get(API_ENDPOINTS.CSRF_COOKIE)
}

export const loginApi = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const normalizedPayload: LoginPayload = {
    username: payload.username.trim(),
    password: payload.password,
  }

  await getCsrfCookie()
  const response = await axiosInstance.post<LoginResponse>(
    API_ENDPOINTS.LOGIN,
    normalizedPayload
  )

  if (!response.data.success || !response.data.data?.user) {
    throw new Error(response.data.message || 'Login failed')
  }

  return getCurrentUserApi()
}

export const logoutApi = async (): Promise<BaseResponse<null>> => {
  const response = await axiosInstance.post<BaseResponse<null>>(
    API_ENDPOINTS.LOGOUT
  )
  return response.data
}

export const getCurrentUserApi = async (): Promise<
  BaseResponse<{ user: User }>
> => {
  const response = await axiosInstance.get<BaseResponse<{ user: User }>>(
    API_ENDPOINTS.ME
  )
  return response.data
}
