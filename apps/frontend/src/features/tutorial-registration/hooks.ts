import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import { getStudentTutorialPeriods } from '@/features/tutorial-registration/api/studentTutorialPeriods.api'
import { getStudentTutorialRegistrationInfo } from '@/features/tutorial-registration/api/studentTutorialRegistrationInfo.api'
import {
  cancelStudentTutorialCourse,
  registerStudentTutorialCourse,
} from '@/features/tutorial-registration/api/studentTutorialRegistrations.api'

export const studentTutorialPeriodsQueryKey = ['student-tutorial-periods'] as const
export const studentTutorialRegistrationInfoQueryKey = ['student-tutorial-registration-info'] as const

export const useStudentTutorialPeriods = () => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: studentTutorialPeriodsQueryKey,
    enabled: authStatus === 'authenticated',
    queryFn: getStudentTutorialPeriods,
  })
}

export const useStudentTutorialRegistrationInfo = (
  tutorialPeriodId: number | null
) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...studentTutorialRegistrationInfoQueryKey, tutorialPeriodId],
    enabled: authStatus === 'authenticated' && tutorialPeriodId !== null,
    queryFn: () => getStudentTutorialRegistrationInfo(tutorialPeriodId as number),
  })
}

export const useRegisterStudentTutorialCourseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tutorialPeriodId,
      courseCode,
    }: {
      tutorialPeriodId: number
      courseCode: string
    }) => registerStudentTutorialCourse(tutorialPeriodId, courseCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...studentTutorialRegistrationInfoQueryKey, variables.tutorialPeriodId],
      })
    },
  })
}

export const useCancelStudentTutorialCourseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tutorialPeriodId,
      courseCode,
    }: {
      tutorialPeriodId: number
      courseCode: string
    }) => cancelStudentTutorialCourse(tutorialPeriodId, courseCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...studentTutorialRegistrationInfoQueryKey, variables.tutorialPeriodId],
      })
    },
  })
}
