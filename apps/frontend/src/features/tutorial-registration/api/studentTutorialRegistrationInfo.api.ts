import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type { StudentTutorialRegistrationInfo } from '@/features/tutorial-registration/types/studentTutorialRegistrationInfo.types'

export type StudentTutorialRegistrationInfoResponse =
  BaseResponse<StudentTutorialRegistrationInfo>

export const getStudentTutorialRegistrationInfo = async (
  tutorialPeriodId: number
): Promise<StudentTutorialRegistrationInfoResponse> => {
  const response = await http.get<StudentTutorialRegistrationInfoResponse>(
    `/api/v1/student/tutorial-periods/${tutorialPeriodId}/registration-info`
  )

  return response.data
}
