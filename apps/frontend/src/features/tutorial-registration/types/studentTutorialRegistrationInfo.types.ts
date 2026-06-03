export type StudentTutorialCourse = {
  courseCode: string
  courseName: string
  credits: number
}

export type StudentTutorialRegistrationSummary = {
  id: number
  title: string
  academicPeriod: {
    id: number
    name: string
  } | null
  registrationEndAt: string | null
  status: 'OPEN'
}

export type StudentTutorialRegistrationInfo = {
  tutorialPeriod: StudentTutorialRegistrationSummary
  availableCourses: StudentTutorialCourse[]
  registeredCourses: StudentTutorialCourse[]
}
