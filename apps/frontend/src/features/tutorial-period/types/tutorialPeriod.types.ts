export const tutorialPeriodStatuses = [
  'DRAFT',
  'OPEN',
  'ASSIGNING',
  'ONGOING',
  'CLOSED',
] as const

export type TutorialPeriodStatus = (typeof tutorialPeriodStatuses)[number]

export interface TutorialPeriodCreator {
  id: number
  username: string
}

export interface TutorialPeriodPermissions {
  canEdit: boolean
  canDelete: boolean
  canOpen: boolean
}

export interface TutorialPeriod {
  id: number
  title: string
  description: string
  startRegDate: string
  endRegDate: string
  startStudyDate: string
  endStudyDate: string
  status: TutorialPeriodStatus
  createdBy?: TutorialPeriodCreator | null
  createdAt: string
  updatedAt: string
  openedAt?: string | null
  assignedAt?: string | null
  startedAt?: string | null
  closedAt?: string | null
  permissions?: TutorialPeriodPermissions
}

export interface TutorialPeriodListParams {
  page: number
  limit: number
  search: string
  status: TutorialPeriodStatus | 'ALL'
}
