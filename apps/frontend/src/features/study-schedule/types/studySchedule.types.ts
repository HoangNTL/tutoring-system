export type StudyScheduleItem = {
  courseCode: string
  courseName: string
  credits: number
  dayOfWeek: number | null
  startPeriod: number | null
  room: string | null
  lecturerName: string | null
  totalSessions: number | null
  periodsPerSession: number | null
  classStatus: string | null
}

export type SchedulePeriodOption = {
  id: number
  title: string
  status: string
}

export type StudyScheduleResponse = {
  periods: SchedulePeriodOption[]
  schedules: StudyScheduleItem[]
}
