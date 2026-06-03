export type DepartmentTutorialPeriodStatus = 'ASSIGNING' | 'ONGOING' | 'CLOSED'

export type DepartmentTutorialPeriodOption = {
  id: number
  title: string
  academicPeriod?: {
    id: number
    name: string
  } | null
  status: DepartmentTutorialPeriodStatus
}

export type DepartmentCourseRegistrationSummary = {
  courseCode: string
  courseName: string
  credits: number
  studentCount: number
}

export type DepartmentRegisteredStudent = {
  id: number
  studentCode: string
  fullName: string | null
  registeredAt: string
}
