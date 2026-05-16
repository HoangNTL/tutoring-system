import http from '@/shared/api/http'
import type { BaseResponse, PaginationMeta } from '@/shared/types/api'
import type { TutorialPeriodFormValues } from '@/features/tutorial-period/schemas/tutorialPeriod.schema'
import type {
  TutorialPeriod,
  TutorialPeriodListParams,
} from '@/features/tutorial-period/types/tutorialPeriod.types'

const TUTORIAL_PERIODS_ENDPOINT = '/api/v1/tutorial-periods'

type TutorialPeriodListResponse = BaseResponse<TutorialPeriod[]> & {
  meta?: PaginationMeta
}

export type TutorialPeriodResponse = BaseResponse<TutorialPeriod>

export const getTutorialPeriods = async (
  params: TutorialPeriodListParams
): Promise<TutorialPeriodListResponse> => {
  const requestParams: Record<string, string | number> = {
    page: params.page,
    limit: params.limit,
  }

  if (params.search.trim() !== '') {
    requestParams.search = params.search.trim()
  }

  if (params.status !== 'ALL') {
    requestParams.status = params.status
  }

  const response = await http.get<TutorialPeriodListResponse>(
    TUTORIAL_PERIODS_ENDPOINT,
    {
      params: requestParams,
    }
  )

  return response.data
}

export const createTutorialPeriod = async (
  values: TutorialPeriodFormValues
): Promise<TutorialPeriodResponse> => {
  const response = await http.post<TutorialPeriodResponse>(
    TUTORIAL_PERIODS_ENDPOINT,
    values
  )

  return response.data
}

export const updateTutorialPeriod = async (
  tutorialPeriodId: number,
  values: TutorialPeriodFormValues
): Promise<TutorialPeriodResponse> => {
  const response = await http.put<TutorialPeriodResponse>(
    `${TUTORIAL_PERIODS_ENDPOINT}/${tutorialPeriodId}`,
    values
  )

  return response.data
}

export const deleteTutorialPeriod = async (
  tutorialPeriodId: number
): Promise<BaseResponse<null>> => {
  const response = await http.delete<BaseResponse<null>>(
    `${TUTORIAL_PERIODS_ENDPOINT}/${tutorialPeriodId}`
  )

  return response.data
}
