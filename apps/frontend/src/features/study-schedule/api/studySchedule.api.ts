import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type { StudyScheduleResponse } from '@/features/study-schedule/types/studySchedule.types'

const STUDY_SCHEDULE_ENDPOINT = '/api/v1/student/study-schedule'

export type StudyScheduleApiResponse = BaseResponse<StudyScheduleResponse>

export const getStudySchedule = async (
  tutorialPeriodId?: number | null
): Promise<StudyScheduleApiResponse> => {
  const response = await http.get<StudyScheduleApiResponse>(STUDY_SCHEDULE_ENDPOINT, {
    params: tutorialPeriodId ? { tutorialPeriodId } : {},
  })

  return response.data
}
