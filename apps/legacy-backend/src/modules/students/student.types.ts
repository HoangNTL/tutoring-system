import { BaseQueryParams } from '@/shared/types';

export interface Student {
  id: number;
  studentCode: string;
  dateOfBirth: string;
}

export interface StudentQueryParams extends BaseQueryParams {}
