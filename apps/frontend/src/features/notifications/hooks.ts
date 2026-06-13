import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '@/app/store/hooks'
import { getNotifications, markNotificationAsRead } from './api'

export const notificationsQueryKey = ['notifications'] as const

export const useNotifications = () => {
  const authStatus = useAppSelector((state) => state.auth.status)
  const user = useAppSelector((state) => state.auth.user)

  return useQuery({
    queryKey: notificationsQueryKey,
    enabled: authStatus === 'authenticated' && user?.role === 'STUDENT',
    queryFn: getNotifications,
    refetchInterval: 15000, // Poll every 15 seconds
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKey,
      })
    },
  })
}
