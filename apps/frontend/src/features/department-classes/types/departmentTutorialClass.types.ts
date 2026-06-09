export type DepartmentTutorialClassStatus =
  | 'PLANNED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'CANCELLED'

export type DepartmentTutorialClassSchedule = {
  id: number
  tutorialClassId: number
  roomId: number
  roomCode: string | null
  roomName: string | null
  roomCapacity: number | null
  dayOfWeek: number
  startPeriod: number
  endPeriod: number
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
  lecturerId: number | null
  lecturerCode: string | null
  lecturerName: string | null
  scheduleCount: number
  schedulePreview: DepartmentTutorialClassSchedule | null
  status: DepartmentTutorialClassStatus
  assignedAt: string | null
  cancelledAt: string | null
}

export type DepartmentLecturer = {
  id: number
  code: string
  fullName: string
  departmentName?: string
}

export type DepartmentLecturerOption = DepartmentLecturer

export type DepartmentRoomOption = {
  id: number
  code: string
  name: string
  capacity: number | null
}

export type DepartmentWeeklyTimetableItem = {
  id: number
  classId: number
  courseCode: string
  courseName: string
  lecturerId: number | null
  lecturerName: string
  roomCode: string
  roomName: string
  dayOfWeek: number
  startPeriod: number
  endPeriod: number
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

export type AssignDepartmentTutorialClassLecturerPayload = {
  lecturerId: number
}

export type CreateDepartmentTutorialClassSchedulePayload = {
  roomId: number
  dayOfWeek: number
  startPeriod: number
}
