import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type { TeachingScheduleResponse } from '@/features/teaching-schedule/types/teachingSchedule.types'

const TEACHING_SCHEDULE_ENDPOINT = '/api/v1/lecturer/teaching-schedule'

export type TeachingScheduleApiResponse = BaseResponse<TeachingScheduleResponse>

export const getTeachingSchedule = async (
  tutorialPeriodId?: number | null
): Promise<TeachingScheduleApiResponse> => {
  const response = await http.get<TeachingScheduleApiResponse>(TEACHING_SCHEDULE_ENDPOINT, {
    params: tutorialPeriodId ? { tutorialPeriodId } : {},
  })

  return response.data
}
