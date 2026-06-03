import { useQuery } from '@tanstack/react-query'

import { useAppSelector } from '@/app/store/hooks'
import { getUsers } from '@/features/users/api/users.api'
import type { UserListParams } from '@/features/users/types/user.types'

export const usersQueryKey = ['users'] as const

export const useUsers = (params: UserListParams) => {
  const authStatus = useAppSelector((state) => state.auth.status)

  return useQuery({
    queryKey: [...usersQueryKey, params.page, params.limit, params.search, params.role],
    enabled: authStatus === 'authenticated',
    queryFn: () => getUsers(params),
    placeholderData: (previousData) => previousData,
  })
}
