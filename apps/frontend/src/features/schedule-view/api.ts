import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'

import type { UserScheduleItem } from '@/features/schedule-view/types'

const STUDENT_SCHEDULES_ENDPOINT = '/api/v1/student/schedules'
const LECTURER_SCHEDULES_ENDPOINT = '/api/v1/lecturer/schedules'

export type UserSchedulesResponse = BaseResponse<UserScheduleItem[]>

export const getStudentSchedules = async (): Promise<UserSchedulesResponse> => {
  const response = await http.get<UserSchedulesResponse>(STUDENT_SCHEDULES_ENDPOINT)

  return response.data
}

export const getLecturerSchedules = async (): Promise<UserSchedulesResponse> => {
  const response = await http.get<UserSchedulesResponse>(LECTURER_SCHEDULES_ENDPOINT)

  return response.data
}
