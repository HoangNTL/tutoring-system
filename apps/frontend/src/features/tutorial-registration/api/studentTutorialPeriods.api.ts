import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type { StudentTutorialPeriod } from '@/features/tutorial-registration/types/studentTutorialPeriod.types'

const STUDENT_TUTORIAL_PERIODS_ENDPOINT = '/api/v1/student/tutorial-periods'

export type StudentTutorialPeriodsResponse = BaseResponse<StudentTutorialPeriod[]>

export const getStudentTutorialPeriods = async (): Promise<StudentTutorialPeriodsResponse> => {
  const response = await http.get<StudentTutorialPeriodsResponse>(
    STUDENT_TUTORIAL_PERIODS_ENDPOINT
  )

  return response.data
}
