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
      // Clear keys starting with 'seen_active_popup_' upon logout
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('seen_active_popup_')) {
          sessionStorage.removeItem(key)
        }
      })
    },
  })
}
