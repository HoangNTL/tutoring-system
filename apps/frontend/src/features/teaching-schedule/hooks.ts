import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import { getTeachingSchedule } from '@/features/teaching-schedule/api/teachingSchedule.api'

export const teachingScheduleQueryKey = ['teaching-schedule'] as const

export const useTeachingSchedule = (tutorialPeriodId?: number | null) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...teachingScheduleQueryKey, tutorialPeriodId],
    enabled: authStatus === 'authenticated',
    queryFn: () => getTeachingSchedule(tutorialPeriodId),
  })
}
