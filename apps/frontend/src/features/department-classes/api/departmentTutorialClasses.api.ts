import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type {
  AssignDepartmentTutorialClassLecturerPayload,
  CreateDepartmentTutorialClassSchedulePayload,
  CreateDepartmentTutorialClassPayload,
  DepartmentLecturerOption,
  DepartmentRoomOption,
  DepartmentTutorialClass,
  DepartmentTutorialClassSchedule,
  DepartmentWeeklyTimetableItem,
  UpdateDepartmentTutorialClassPayload,
} from '@/features/department-classes/types/departmentTutorialClass.types'

const DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT = '/api/v1/department/tutorial-periods'
const DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT = '/api/v1/department/classes'
const DEPARTMENT_ENDPOINT = '/api/v1/department'

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

export const getDepartmentLecturers = async (): Promise<
  BaseResponse<DepartmentLecturerOption[]>
> => {
  const response = await http.get<BaseResponse<DepartmentLecturerOption[]>>(
    `${DEPARTMENT_ENDPOINT}/lecturers`
  )

  return response.data
}

export const getDepartmentRooms = async (): Promise<
  BaseResponse<DepartmentRoomOption[]>
> => {
  const response = await http.get<BaseResponse<DepartmentRoomOption[]>>(
    `${DEPARTMENT_ENDPOINT}/rooms`
  )

  return response.data
}

export const assignDepartmentTutorialClassLecturer = async (
  classId: number,
  payload: AssignDepartmentTutorialClassLecturerPayload
): Promise<BaseResponse<DepartmentTutorialClass>> => {
  const response = await http.patch<BaseResponse<DepartmentTutorialClass>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/assign-lecturer`,
    payload
  )

  return response.data
}

export const getDepartmentTutorialClassSchedules = async (
  classId: number,
): Promise<BaseResponse<DepartmentTutorialClassSchedule[]>> => {
  const response = await http.get<BaseResponse<DepartmentTutorialClassSchedule[]>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/schedules`
  )

  return response.data
}

export const createDepartmentTutorialClassSchedule = async (
  classId: number,
  payload: CreateDepartmentTutorialClassSchedulePayload
): Promise<BaseResponse<DepartmentTutorialClassSchedule>> => {
  const response = await http.post<BaseResponse<DepartmentTutorialClassSchedule>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/schedules`,
    payload
  )

  return response.data
}

export const deleteDepartmentTutorialClassSchedule = async (
  classId: number,
  scheduleId: number
): Promise<BaseResponse<DepartmentTutorialClassSchedule>> => {
  const response = await http.delete<BaseResponse<DepartmentTutorialClassSchedule>>(
    `${DEPARTMENT_TUTORIAL_CLASSES_ENDPOINT}/${classId}/schedules/${scheduleId}`
  )

  return response.data
}

export const getDepartmentWeeklyTimetable = async (
  tutorialPeriodId: number
): Promise<BaseResponse<DepartmentWeeklyTimetableItem[]>> => {
  const response = await http.get<BaseResponse<DepartmentWeeklyTimetableItem[]>>(
    `${DEPARTMENT_TUTORIAL_PERIODS_ENDPOINT}/${tutorialPeriodId}/weekly-timetable`
  )

  return response.data
}
