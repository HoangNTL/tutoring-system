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
  const currentUserId = useAppSelector((state) => state.auth.user?.id)

  return useMutation({
    mutationFn: async (payload: TutorialPeriodPayload) => {
      if (!currentUserId) {
        throw new Error('Không tìm thấy người dùng hiện tại.')
      }

      const createPayload: CreateTutorialPeriodPayload = {
        ...payload,
        user_id: currentUserId,
      }

      return createTutorialPeriod(createPayload)
    },
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
