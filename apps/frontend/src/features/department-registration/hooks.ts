import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import {
  getDepartmentCourseRegistrationSummary,
  getDepartmentRegisteredStudents,
  getDepartmentTutorialPeriods,
} from '@/features/department-registration/api/departmentTutorialRegistrations.api'

export const departmentTutorialPeriodsQueryKey = ['department-tutorial-periods'] as const
export const departmentCourseRegistrationsQueryKey = ['department-course-registrations'] as const
export const departmentRegisteredStudentsQueryKey = ['department-registered-students'] as const

export const useDepartmentTutorialPeriods = () => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: departmentTutorialPeriodsQueryKey,
    enabled: authStatus === 'authenticated',
    queryFn: getDepartmentTutorialPeriods,
  })
}

export const useDepartmentCourseRegistrationSummary = (
  tutorialPeriodId: number | null
) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...departmentCourseRegistrationsQueryKey, tutorialPeriodId],
    enabled: authStatus === 'authenticated' && tutorialPeriodId !== null,
    queryFn: () => getDepartmentCourseRegistrationSummary(tutorialPeriodId as number),
    placeholderData: (previousData) => previousData,
  })
}

export const useDepartmentRegisteredStudents = (
  tutorialPeriodId: number | null,
  courseCode: string | null,
  enabled: boolean
) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...departmentRegisteredStudentsQueryKey, tutorialPeriodId, courseCode],
    enabled:
      authStatus === 'authenticated' &&
      enabled &&
      tutorialPeriodId !== null &&
      courseCode !== null,
    queryFn: () =>
      getDepartmentRegisteredStudents(
        tutorialPeriodId as number,
        courseCode as string
      ),
  })
}
