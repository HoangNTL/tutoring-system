import { IBaseQueryParams } from '@/types/common';

export interface IDepartment {
  id: number;
  name: string;
}

export interface IDepartmentParams extends IBaseQueryParams {
  // additional query parameters can be added here if needed
}
