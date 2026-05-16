import { BaseQueryParams } from '@/shared/types';

export interface Lecturer {
  id: number;
  lecturerCode: string;
  dateOfBirth: string;
}

export interface LecturerQueryParams extends BaseQueryParams {}
