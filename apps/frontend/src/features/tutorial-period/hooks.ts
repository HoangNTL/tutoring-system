import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createTutorialPeriod,
  deleteTutorialPeriod,
  getTutorialPeriods,
  updateTutorialPeriod,
} from '@/features/tutorial-period/api/tutorialPeriod.api'
import type {
  TutorialPeriodListParams,
} from '@/features/tutorial-period/types/tutorialPeriod.types'
import type { TutorialPeriodFormValues } from '@/features/tutorial-period/schemas/tutorialPeriod.schema'
import { useAppSelector } from '@/app/store/hooks'

export const tutorialPeriodsQueryKey = ['tutorial-periods'] as const

export const useTutorialPeriods = (params: TutorialPeriodListParams) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [
      ...tutorialPeriodsQueryKey,
      params.page,
      params.limit,
      params.search,
      params.status,
    ],
    enabled: authStatus === 'authenticated',
    queryFn: () => getTutorialPeriods(params),
    placeholderData: (previousData) => previousData,
  })
}

export const useCreateTutorialPeriodMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTutorialPeriod,
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
      payload: TutorialPeriodFormValues
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
