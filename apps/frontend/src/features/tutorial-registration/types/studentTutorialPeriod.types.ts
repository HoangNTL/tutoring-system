export type StudentTutorialPeriodStatus =
  | 'OPEN'
  | 'ASSIGNING'
  | 'ONGOING'
  | 'CLOSED'

export type StudentTutorialRegistrationPermissions = {
  canViewRegistrationInfo: boolean
  canRegister: boolean
  canCancelRegistration: boolean
  canViewSchedule: boolean
}

export const studentTutorialPeriodStatusLabels: Record<
  StudentTutorialPeriodStatus,
  string
> = {
  OPEN: 'Đang mở đăng ký',
  ASSIGNING: 'Đang xử lý đăng ký',
  ONGOING: 'Đang học',
  CLOSED: 'Đã kết thúc',
}

export type StudentTutorialPeriod = {
  id: number
  academicPeriodId: number | null
  academicPeriod: {
    id: number
    name: string
  } | null
  title: string
  description: string | null
  registrationStartAt: string | null
  registrationEndAt: string | null
  studyStartAt: string | null
  studyEndAt: string | null
  status: StudentTutorialPeriodStatus
  permissions: StudentTutorialRegistrationPermissions
}
