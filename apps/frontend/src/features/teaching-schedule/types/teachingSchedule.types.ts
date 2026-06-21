export type TeachingScheduleItem = {
  classId: number
  courseCode: string
  courseName: string
  credits: number
  dayOfWeek: number | null
  startPeriod: number | null
  room: string | null
  totalSessions: number | null
  periodsPerSession: number | null
  totalPeriods: number | null
  studentCount: number
  classStatus: string | null
  schedules?: Array<{
    dayOfWeek: number
    startPeriod: number
    room: string
  }>
}

export type SchedulePeriodOption = {
  id: number
  title: string
  status: string
  studyStartAt?: string
  studyEndAt?: string
}

export type TeachingScheduleResponse = {
  periods: SchedulePeriodOption[]
  schedules: TeachingScheduleItem[]
}
