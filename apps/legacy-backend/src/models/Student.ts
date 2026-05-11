import { IBaseQueryParams } from '@/types/common';

export interface IStudent {
  id: number;
  studentCode: string;
  dateOfBirth: string;
}

export interface IStudentParams extends IBaseQueryParams {
  // additional query parameters can be added here if needed
}
