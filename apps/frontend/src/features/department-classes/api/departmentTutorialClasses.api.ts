import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type {
  CreateDepartmentTutorialClassPayload,
  DepartmentTutorialClass,
  UpdateDepartmentTutorialClassPayload,
  UpdateClassSchedulePayload,
  UpdateClassLecturerPayload,
  StudentSchedulesResponse,
} from '@/features/department-classes/types/departmentTutorialClass.types'

const DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT = '/api/v1/department/tutorial-periods'
const DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT = '/api/v1/department/classes'

export type DepartmentLecturer = {
  id: number
  lecturerCode: string
  dateOfBirth: string | null
  firstName: string | null
  lastName: string | null
  fullName: string | null
}

export const getDepartmentLecturers = async (
  courseCode?: string
): Promise<BaseResponse<DepartmentLecturer[]>> => {
  const response = await http.get<BaseResponse<DepartmentLecturer[]>>(
    '/api/v1/department/lecturers',
    {
      params: courseCode ? { courseCode } : {},
    }
  )

  return response.data
}

export const getDepartmentTutorialClasses = async (
  tutorialPeriodId: number
): Promise<BaseResponse<DepartmentTutorialClass[]>> => {
  const response = await http.get<BaseResponse<DepartmentTutorialClass[]>>(
    `${DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT}/${tutorialPeriodId}/classes`
  )

  return response.data
}

export const createDepartmentTutorialClass = async (
  tutorialPeriodId: number,
  payload: CreateDepartmentTutorialClassPayload
): Promise<BaseResponse<DepartmentTutorialClass>> => {
  const response = await http.post<BaseResponse<DepartmentTutorialClass>>(
    `${DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT}/${tutorialPeriodId}/classes`,
    payload
  )

  return response.data
}

export const updateDepartmentTutorialClass = async (
  classId: number,
  payload: UpdateDepartmentTutorialClassPayload
): Promise<BaseResponse<DepartmentTutorialClass>> => {
  const response = await http.put<BaseResponse<DepartmentTutorialClass>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}`,
    payload
  )

  return response.data
}

export const cancelDepartmentTutorialClass = async (
  classId: number
): Promise<BaseResponse<DepartmentTutorialClass>> => {
  const response = await http.patch<BaseResponse<DepartmentTutorialClass>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/cancel`
  )

  return response.data
}

export const restoreDepartmentTutorialClass = async (
  classId: number
): Promise<BaseResponse<DepartmentTutorialClass>> => {
  const response = await http.patch<BaseResponse<DepartmentTutorialClass>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/restore`
  )

  return response.data
}

export const updateClassSchedule = async (
  classId: number,
  payload: UpdateClassSchedulePayload
): Promise<BaseResponse<DepartmentTutorialClass>> => {
  const response = await http.put<BaseResponse<DepartmentTutorialClass>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/schedule`,
    payload
  )

  return response.data
}

export const updateClassLecturer = async (
  classId: number,
  payload: UpdateClassLecturerPayload
): Promise<BaseResponse<DepartmentTutorialClass>> => {
  const response = await http.put<BaseResponse<DepartmentTutorialClass>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/lecturer`,
    payload
  )

  return response.data
}

export const getStudentSchedulesForClass = async (
  classId: number
): Promise<BaseResponse<StudentSchedulesResponse>> => {
  const response = await http.get<BaseResponse<StudentSchedulesResponse>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/student-schedules`
  )

  return response.data
}
