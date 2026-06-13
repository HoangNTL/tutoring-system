import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type { DbNotification } from './types'

export const getNotifications = async (): Promise<BaseResponse<DbNotification[]>> => {
  const response = await http.get<BaseResponse<DbNotification[]>>('/api/v1/notifications')
  return response.data
}

export const markNotificationAsRead = async (id: string): Promise<BaseResponse<null>> => {
  const response = await http.patch<BaseResponse<null>>(`/api/v1/notifications/${id}/read`)
  return response.data
}
