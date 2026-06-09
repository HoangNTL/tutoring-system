import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import {
  assignDepartmentTutorialClassLecturer,
  cancelDepartmentTutorialClass,
  createDepartmentTutorialClassSchedule,
  createDepartmentTutorialClass,
  deleteDepartmentTutorialClassSchedule,
  getDepartmentLecturers,
  getDepartmentRooms,
  getDepartmentTutorialClassSchedules,
  getDepartmentTutorialClasses,
  getDepartmentWeeklyTimetable,
  restoreDepartmentTutorialClass,
  updateDepartmentTutorialClass,
} from '@/features/department-classes/api/departmentTutorialClasses.api'
import { departmentCourseRegistrationsQueryKey } from '@/features/department-registration/hooks'
import type {
  AssignDepartmentTutorialClassLecturerPayload,
  CreateDepartmentTutorialClassSchedulePayload,
  CreateDepartmentTutorialClassPayload,
  UpdateDepartmentTutorialClassPayload,
} from '@/features/department-classes/types/departmentTutorialClass.types'

export const departmentTutorialClassesQueryKey = ['department-tutorial-classes'] as const
export const departmentLecturersQueryKey = ['department-lecturers'] as const
export const departmentRoomsQueryKey = ['department-rooms'] as const
export const departmentWeeklyTimetableQueryKey = ['department-weekly-timetable'] as const
export const departmentTutorialClassSchedulesQueryKey = ['department-tutorial-class-schedules'] as const

export const useDepartmentTutorialClasses = (tutorialPeriodId: number | null) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...departmentTutorialClassesQueryKey, tutorialPeriodId],
    enabled: authStatus === 'authenticated' && tutorialPeriodId !== null,
    queryFn: () => getDepartmentTutorialClasses(tutorialPeriodId as number),
    placeholderData: (previousData) => previousData,
  })
}

export const useDepartmentLecturers = () => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: departmentLecturersQueryKey,
    enabled: authStatus === 'authenticated',
    queryFn: getDepartmentLecturers,
    staleTime: 5 * 60 * 1000,
  })
}

export const useDepartmentRooms = () => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: departmentRoomsQueryKey,
    enabled: authStatus === 'authenticated',
    queryFn: getDepartmentRooms,
    staleTime: 5 * 60 * 1000,
  })
}

export const useDepartmentWeeklyTimetable = (tutorialPeriodId: number | null) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...departmentWeeklyTimetableQueryKey, tutorialPeriodId],
    enabled: authStatus === 'authenticated' && tutorialPeriodId !== null,
    queryFn: () => getDepartmentWeeklyTimetable(tutorialPeriodId as number),
    placeholderData: (previousData) => previousData,
  })
}

export const useDepartmentTutorialClassSchedules = (classId: number | null) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...departmentTutorialClassSchedulesQueryKey, classId],
    enabled: authStatus === 'authenticated' && classId !== null,
    queryFn: () => getDepartmentTutorialClassSchedules(classId as number),
  })
}

export const useCreateDepartmentTutorialClassMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tutorialPeriodId,
      payload,
    }: {
      tutorialPeriodId: number
      payload: CreateDepartmentTutorialClassPayload
    }) => createDepartmentTutorialClass(tutorialPeriodId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassesQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentWeeklyTimetableQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentCourseRegistrationsQueryKey, variables.tutorialPeriodId],
      })
    },
  })
}

export const useUpdateDepartmentTutorialClassMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
      payload,
    }: {
      classId: number
      tutorialPeriodId: number
      payload: UpdateDepartmentTutorialClassPayload
    }) => updateDepartmentTutorialClass(classId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassesQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentWeeklyTimetableQueryKey, variables.tutorialPeriodId],
      })
    },
  })
}

export const useCancelDepartmentTutorialClassMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
    }: {
      classId: number
      tutorialPeriodId: number
    }) => cancelDepartmentTutorialClass(classId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassesQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentWeeklyTimetableQueryKey, variables.tutorialPeriodId],
      })
    },
  })
}

export const useRestoreDepartmentTutorialClassMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
    }: {
      classId: number
      tutorialPeriodId: number
    }) => restoreDepartmentTutorialClass(classId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassesQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentWeeklyTimetableQueryKey, variables.tutorialPeriodId],
      })
    },
  })
}

export const useAssignDepartmentTutorialClassLecturerMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
      payload,
    }: {
      classId: number
      tutorialPeriodId: number
      payload: AssignDepartmentTutorialClassLecturerPayload
    }) => assignDepartmentTutorialClassLecturer(classId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassesQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentWeeklyTimetableQueryKey, variables.tutorialPeriodId],
      })
    },
  })
}

export const useCreateDepartmentTutorialClassScheduleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
      payload,
    }: {
      classId: number
      tutorialPeriodId: number
      payload: CreateDepartmentTutorialClassSchedulePayload
    }) => createDepartmentTutorialClassSchedule(classId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassesQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentWeeklyTimetableQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassSchedulesQueryKey, variables.classId],
      })
    },
  })
}

export const useDeleteDepartmentTutorialClassScheduleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
      scheduleId,
    }: {
      classId: number
      tutorialPeriodId: number
      scheduleId: number
    }) => deleteDepartmentTutorialClassSchedule(classId, scheduleId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassesQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentWeeklyTimetableQueryKey, variables.tutorialPeriodId],
      })
      queryClient.invalidateQueries({
        queryKey: [...departmentTutorialClassSchedulesQueryKey, variables.classId],
      })
    },
  })
}
