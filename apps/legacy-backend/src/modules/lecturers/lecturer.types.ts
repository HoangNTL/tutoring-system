import { BaseQueryParams } from '@/shared/types';

export interface Lecturer {
  id: number;
  lecturerCode: string;
  dateOfBirth: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface LecturerQueryParams extends BaseQueryParams {
  departmentId?: number;
}
