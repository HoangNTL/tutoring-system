import type {
  StudentTutorialPeriodStatus,
  StudentTutorialRegistrationPermissions,
} from '@/features/tutorial-registration/types/studentTutorialPeriod.types'

export type StudentTutorialCourse = {
  courseCode: string
  courseName: string
  credits: number
  registeredAt?: string | null
}

export type StudentTutorialRegistrationSummary = {
  id: number
  title: string
  academicPeriod: {
    id: number
    name: string
  } | null
  registrationEndAt: string | null
  status: StudentTutorialPeriodStatus
}

export type StudentTutorialRegistrationInfo = {
  tutorialPeriod: StudentTutorialRegistrationSummary
  permissions: StudentTutorialRegistrationPermissions
  availableCourses: StudentTutorialCourse[]
  registeredCourses: StudentTutorialCourse[]
}
