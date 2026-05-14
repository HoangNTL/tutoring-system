import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createTutorialPeriod,
  deleteTutorialPeriod,
  getTutorialPeriods,
  updateTutorialPeriod,
} from '@/features/tutorial-period/tutorialPeriod.api'
import type {
  CreateTutorialPeriodPayload,
  TutorialPeriodListParams,
  TutorialPeriodPayload,
} from '@/features/tutorial-period/types'
import { useAppSelector } from '@/store/hooks'

export const tutorialPeriodsQueryKey = ['tutorial-periods'] as const

export const useTutorialPeriods = (params: TutorialPeriodListParams) => {
  const { hasCheckedAuth, isAuthenticated } = useAppSelector(
    (state) => state.auth
  )

  return useQuery({
    queryKey: [
      ...tutorialPeriodsQueryKey,
      params.page,
      params.limit,
      params.search,
      params.status,
    ],
    enabled: hasCheckedAuth && isAuthenticated,
    queryFn: () => getTutorialPeriods(params),
    placeholderData: (previousData) => previousData,
  })
}

export const useCreateTutorialPeriodMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTutorialPeriodPayload) =>
      createTutorialPeriod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorialPeriodsQueryKey })
    },
  })
}

export const useUpdateTutorialPeriodMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tutorialPeriodId,
      payload,
    }: {
      tutorialPeriodId: number
      payload: TutorialPeriodPayload
    }) => updateTutorialPeriod(tutorialPeriodId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorialPeriodsQueryKey })
    },
  })
}

export const useDeleteTutorialPeriodMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTutorialPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tutorialPeriodsQueryKey })
    },
  })
}
