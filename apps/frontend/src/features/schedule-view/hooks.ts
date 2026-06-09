import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import {
  getLecturerSchedules,
  getStudentSchedules,
} from '@/features/schedule-view/api'

export const studentSchedulesQueryKey = ['student-schedules'] as const
export const lecturerSchedulesQueryKey = ['lecturer-schedules'] as const

export const useStudentSchedules = () => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: studentSchedulesQueryKey,
    enabled: authStatus === 'authenticated',
    queryFn: getStudentSchedules,
  })
}

export const useLecturerSchedules = () => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: lecturerSchedulesQueryKey,
    enabled: authStatus === 'authenticated',
    queryFn: getLecturerSchedules,
  })
}
