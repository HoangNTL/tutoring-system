export type DepartmentTutorialClassStatus = 'PLANNED' | 'CANCELLED'

export type TutorialClassSchedule = {
  dayOfWeek: number
  startPeriod: number
  room: string
}

export type DepartmentTutorialClass = {
  id: number
  tutorialPeriodId: number
  courseCode: string
  courseName: string
  credits: number
  studentCount: number
  totalSessions: number
  periodsPerSession: number
  totalPeriods: number
  status: DepartmentTutorialClassStatus
  cancelledAt: string | null
  lecturerId: number | null
  lecturerName: string | null
  dayOfWeek: number | null
  startPeriod: number | null
  room: string | null
  schedules?: TutorialClassSchedule[]
}

export type CreateDepartmentTutorialClassPayload = {
  courseCode: string
  totalSessions: number
  periodsPerSession: number
}

export type UpdateDepartmentTutorialClassPayload = {
  totalSessions: number
  periodsPerSession: number
}

export type UpdateClassSchedulePayload = {
  schedules: TutorialClassSchedule[]
}

export type UpdateClassLecturerPayload = {
  lecturerId: number
  lecturerName: string
}
