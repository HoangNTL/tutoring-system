import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'

export type StudentTutorialRegistrationMutationResponse = BaseResponse<{
  courseCode: string
  courseName: string
  credits: number
  registeredAt?: string | null
  cancelledAt?: string | null
  status: 'REGISTERED' | 'CANCELLED'
}>

export const registerStudentTutorialCourse = async (
  tutorialPeriodId: number,
  courseCode: string
): Promise<StudentTutorialRegistrationMutationResponse> => {
  const response = await http.post<StudentTutorialRegistrationMutationResponse>(
    `/api/v1/student/tutorial-periods/${tutorialPeriodId}/registrations`,
    {
      courseCode,
    }
  )

  return response.data
}

export const cancelStudentTutorialCourse = async (
  tutorialPeriodId: number,
  courseCode: string
): Promise<StudentTutorialRegistrationMutationResponse> => {
  const encodedCourseCode = encodeURIComponent(courseCode)

  const response = await http.delete<StudentTutorialRegistrationMutationResponse>(
    `/api/v1/student/tutorial-periods/${tutorialPeriodId}/registrations/${encodedCourseCode}`
  )

  return response.data
}
