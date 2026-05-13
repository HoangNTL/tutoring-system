import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUserApi, loginApi } from '@/api/auth.api'

export const useLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      if (res.success) {
        queryClient.setQueryData(['me'], res)
      }
    }
  })
}

export const useMeQuery = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getCurrentUserApi,
    retry: false,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data.user
  })
}
