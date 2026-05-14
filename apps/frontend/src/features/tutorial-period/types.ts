import type { BaseResponse, IPaginationMeta } from '@/types/common'

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
  can_edit: boolean
  can_delete: boolean
  can_open: boolean
}

export interface TutorialPeriod {
  id: number
  title: string
  description: string
  start_reg_date: string
  end_reg_date: string
  start_study_date: string
  end_study_date: string
  status: TutorialPeriodStatus
  created_by?: TutorialPeriodCreator | null
  created_at: string
  updated_at: string
  opened_at?: string
  assigned_at?: string
  started_at?: string
  closed_at?: string
  permissions?: TutorialPeriodPermissions
}

export interface TutorialPeriodListParams {
  page: number
  limit: number
  search: string
  status: TutorialPeriodStatus | 'ALL'
}

export interface TutorialPeriodPayload {
  title: string
  description: string
  start_reg_date: string
  end_reg_date: string
  start_study_date: string
  end_study_date: string
}

export interface CreateTutorialPeriodPayload extends TutorialPeriodPayload {
  user_id: number
}

export type TutorialPeriodListResponse = BaseResponse<TutorialPeriod[]> & {
  meta?: IPaginationMeta
}

export type TutorialPeriodResponse = BaseResponse<TutorialPeriod>
