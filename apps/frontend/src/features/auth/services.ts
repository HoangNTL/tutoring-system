import { useMutation } from '@tanstack/react-query'
import { loginApi } from '@/api/auth.api'

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: loginApi,
  })
}
