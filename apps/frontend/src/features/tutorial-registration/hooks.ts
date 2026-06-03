import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import { getStudentTutorialPeriods } from '@/features/tutorial-registration/api/studentTutorialPeriods.api'
import { getStudentTutorialRegistrationInfo } from '@/features/tutorial-registration/api/studentTutorialRegistrationInfo.api'

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
