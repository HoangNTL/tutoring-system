import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAppDispatch } from '@/app/store/hooks'
import { loginApi } from '@/features/auth/api'
import { setAuthUser } from '@/features/auth/authSlice'

export const useLoginMutation = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      dispatch(setAuthUser(response.data.user))
      queryClient.clear()
    },
  })
}
