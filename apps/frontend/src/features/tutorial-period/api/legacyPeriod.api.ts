import http from '@/shared/api/http'
import type { BaseResponse } from '@/shared/types/api'
import type { LegacyPeriod } from '@/features/tutorial-period/types/tutorialPeriod.types'

const LEGACY_PERIODS_ENDPOINT = '/api/v1/legacy/periods'

export type LegacyPeriodsResponse = BaseResponse<LegacyPeriod[]>

export const getLegacyPeriods = async (): Promise<LegacyPeriodsResponse> => {
  const response = await http.get<LegacyPeriodsResponse>(LEGACY_PERIODS_ENDPOINT)

  return response.data
}
