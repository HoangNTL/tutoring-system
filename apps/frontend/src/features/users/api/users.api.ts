import http from '@/shared/api/http'
import type { BaseResponse, PaginationMeta } from '@/shared/types/api'
import type { UserListItem, UserListParams } from '@/features/users/types/user.types'

const USERS_ENDPOINT = '/api/v1/users'

export type UsersListResponse = BaseResponse<UserListItem[]> & {
  meta?: PaginationMeta
}

export const getUsers = async (
  params: UserListParams
): Promise<UsersListResponse> => {
  const requestParams: Record<string, string | number> = {
    page: params.page,
    limit: params.limit,
  }

  if (params.search.trim() !== '') {
    requestParams.search = params.search.trim()
  }

  if (params.role !== 'ALL') {
    requestParams.role = params.role
  }

  const response = await http.get<UsersListResponse>(USERS_ENDPOINT, {
    params: requestParams,
  })

  return response.data
}

export const updateUserPassword = async (
  userId: number,
  password: string
): Promise<BaseResponse<null>> => {
  const response = await http.patch<BaseResponse<null>>(
    `${USERS_ENDPOINT}/${userId}/password`,
    { password }
  )

  return response.data
}
