import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type {
  DepartmentCourseRegistrationSummary,
  DepartmentRegisteredStudent,
  DepartmentTutorialPeriodOption,
} from '@/features/department-registration/types/departmentTutorialRegistration.types'

const DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT = '/api/v1/department/tutorial-periods'

export const getDepartmentTutorialPeriods = async (): Promise<
  BaseResponse<DepartmentTutorialPeriodOption[]>
> => {
  const response = await http.get<BaseResponse<DepartmentTutorialPeriodOption[]>>(
    DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT
  )

  return response.data
}

export const getDepartmentCourseRegistrationSummary = async (
  tutorialPeriodId: number
): Promise<BaseResponse<DepartmentCourseRegistrationSummary[]>> => {
  const response = await http.get<BaseResponse<DepartmentCourseRegistrationSummary[]>>(
    `${DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT}/${tutorialPeriodId}/course-registrations`
  )

  return response.data
}

export const getDepartmentRegisteredStudents = async (
  tutorialPeriodId: number,
  courseCode: string
): Promise<BaseResponse<DepartmentRegisteredStudent[]>> => {
  const response = await http.get<BaseResponse<DepartmentRegisteredStudent[]>>(
    `${DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT}/${tutorialPeriodId}/course-registrations/${encodeURIComponent(courseCode)}/students`
  )

  return response.data
}
