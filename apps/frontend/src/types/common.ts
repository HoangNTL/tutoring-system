export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: IPaginationMeta;
  errors?: unknown;
}

export interface IPaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}
