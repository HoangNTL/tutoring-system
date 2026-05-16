import http from '@/shared/api/http'
import type {
  CreateTutorialPeriodPayload,
  TutorialPeriodListParams,
  TutorialPeriodListResponse,
  TutorialPeriodPayload,
  TutorialPeriodResponse,
} from '@/features/tutorial-period/types'
import type { BaseResponse } from '@/shared/types/api'

const TUTORIAL_PERIODS_ENDPOINT = '/api/v1/tutorial-periods'

const buildTutorialPeriodListParams = (
  params: TutorialPeriodListParams
): Record<string, string | number> => {
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

  return requestParams
}

const normalizeDateForApi = (value: string): string => {
  const trimmedValue = value.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue
  }

  const slashDateMatch = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)

  if (slashDateMatch) {
    const [, month, day, year] = slashDateMatch

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  return trimmedValue
}

const normalizeTutorialPeriodPayload = <TPayload extends TutorialPeriodPayload>(
  payload: TPayload
): TPayload => ({
  ...payload,
  start_reg_date: normalizeDateForApi(payload.start_reg_date),
  end_reg_date: normalizeDateForApi(payload.end_reg_date),
  start_study_date: normalizeDateForApi(payload.start_study_date),
  end_study_date: normalizeDateForApi(payload.end_study_date),
})

export const getTutorialPeriods = async (
  params: TutorialPeriodListParams
): Promise<TutorialPeriodListResponse> => {
  const response = await http.get<TutorialPeriodListResponse>(
    TUTORIAL_PERIODS_ENDPOINT,
    {
      params: buildTutorialPeriodListParams(params),
    }
  )

  return response.data
}

export const createTutorialPeriod = async (
  payload: CreateTutorialPeriodPayload
): Promise<TutorialPeriodResponse> => {
  const normalizedPayload = normalizeTutorialPeriodPayload(payload)

  const response = await http.post<TutorialPeriodResponse>(
    TUTORIAL_PERIODS_ENDPOINT,
    normalizedPayload
  )

  return response.data
}

export const updateTutorialPeriod = async (
  tutorialPeriodId: number,
  payload: TutorialPeriodPayload
): Promise<TutorialPeriodResponse> => {
  const normalizedPayload = normalizeTutorialPeriodPayload(payload)

  const response = await http.put<TutorialPeriodResponse>(
    `${TUTORIAL_PERIODS_ENDPOINT}/${tutorialPeriodId}`,
    normalizedPayload
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
