import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type {
  CreateDepartmentTutorialClassPayload,
  DepartmentTutorialClass,
  UpdateDepartmentTutorialClassPayload,
} from '@/features/department-classes/types/departmentTutorialClass.types'

const DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT = '/api/v1/department/tutorial-periods'
const DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT = '/api/v1/department/classes'

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
