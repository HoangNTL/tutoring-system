export const tutorialPeriodStatuses = [
  'DRAFT',
  'OPEN',
  'ASSIGNING',
  'ONGOING',
  'CLOSED',
  'CANCELLED',
] as const

export type TutorialPeriodStatus = (typeof tutorialPeriodStatuses)[number]

export const tutorialPeriodStatusLabels: Record<TutorialPeriodStatus, string> = {
  DRAFT: 'Bản nháp',
  OPEN: 'Đang mở đăng ký',
  ASSIGNING: 'Đang phân công',
  ONGOING: 'Đang học',
  CLOSED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
}

export type LegacyPeriod = {
  id: number
  name: string
}

export interface TutorialPeriodCreator {
  id: number
  username: string
}

export interface TutorialPeriodPermissions {
  canEdit: boolean
  canDelete: boolean
  canOpen: boolean
  canCancel: boolean
}

export interface TutorialPeriod {
  id: number
  academicPeriodId: number | null
  academicPeriod?: LegacyPeriod | null
  title: string
  description: string
  registrationStartAt: string | null
  registrationEndAt: string | null
  studyStartAt: string | null
  studyEndAt: string | null
  status: TutorialPeriodStatus
  createdBy?: TutorialPeriodCreator | null
  createdAt: string
  updatedAt: string
  permissions?: TutorialPeriodPermissions
}

export interface TutorialPeriodListParams {
  page: number
  limit: number
  search: string
  status: TutorialPeriodStatus | 'ALL'
}
