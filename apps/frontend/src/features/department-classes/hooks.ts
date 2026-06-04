import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import {
  cancelDepartmentTutorialClass,
  createDepartmentTutorialClass,
  getDepartmentTutorialClasses,
  restoreDepartmentTutorialClass,
  updateDepartmentTutorialClass,
} from '@/features/department-classes/api/departmentTutorialClasses.api'
import { departmentCourseRegistrationsQueryKey } from '@/features/department-registration/hooks'
import type {
  CreateDepartmentTutorialClassPayload,
  UpdateDepartmentTutorialClassPayload,
} from '@/features/department-classes/types/departmentTutorialClass.types'

export const departmentTutorialClassesQueryKey = ['department-tutorial-classes'] as const

export const useDepartmentTutorialClasses = (tutorialPeriodId: number | null) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...departmentTutorialClassesQueryKey, tutorialPeriodId],
    enabled: authStatus === 'authenticated' && tutorialPeriodId !== null,
    queryFn: () => getDepartmentTutorialClasses(tutorialPeriodId as number),
    placeholderData: (previousData) => previousData,
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
    },
  })
}
