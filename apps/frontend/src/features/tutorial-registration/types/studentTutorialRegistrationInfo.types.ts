export type StudentTutorialCourse = {
  courseCode: string
  courseName: string
  credits: number
  registeredAt?: string | null
  dayOfWeek?: number | null
  startPeriod?: number | null
  room?: string | null
  lecturerId?: number | null
  lecturerName?: string | null
  classStatus?: string | null
}

export type StudentTutorialRegistrationSummary = {
  id: number
  title: string
  academicPeriod: {
    id: number
    name: string
  } | null
  registrationEndAt: string | null
  status: 'OPEN' | 'ASSIGNING' | 'ONGOING' | 'CLOSED'
}

export type StudentTutorialRegistrationInfo = {
  tutorialPeriod: StudentTutorialRegistrationSummary
  availableCourses: StudentTutorialCourse[]
  registeredCourses: StudentTutorialCourse[]
}
