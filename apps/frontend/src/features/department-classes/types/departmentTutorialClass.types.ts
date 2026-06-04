export type DepartmentTutorialClassStatus = 'PLANNED' | 'CANCELLED'

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
