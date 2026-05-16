import { BaseQueryParams } from '@/shared/types';

export interface Department {
  id: number;
  name: string;
}

export interface DepartmentQueryParams extends BaseQueryParams {}
