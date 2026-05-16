export interface BaseResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
  errors?: unknown
}

export interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}
