import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAppDispatch } from '@/app/store/hooks'
import { logoutApi } from '@/features/auth/api'
import { clearAuth } from '@/features/auth/authSlice'

export const useLogoutMutation = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      queryClient.clear()
      dispatch(clearAuth())
    },
  })
}
