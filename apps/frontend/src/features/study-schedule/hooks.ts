import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import { getStudySchedule } from '@/features/study-schedule/api/studySchedule.api'

export const studyScheduleQueryKey = ['study-schedule'] as const

export const useStudySchedule = (tutorialPeriodId?: number | null) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...studyScheduleQueryKey, tutorialPeriodId],
    enabled: authStatus === 'authenticated',
    queryFn: () => getStudySchedule(tutorialPeriodId),
  })
}
