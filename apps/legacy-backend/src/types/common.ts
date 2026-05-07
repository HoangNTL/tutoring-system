export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface ISortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IBaseQueryParams extends IPaginationParams, ISortParams {
  search?: string;
}

export interface IPaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}
