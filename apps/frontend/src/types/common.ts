export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: IPaginationMeta;
  errors?: any;
}

export interface IPaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}
