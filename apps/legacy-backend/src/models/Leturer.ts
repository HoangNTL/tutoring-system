import { IBaseQueryParams } from '@/types/common';

export interface ILecturer {
  id: number;
  lecturerCode: string;
  dateOfBirth: string;
}

export interface ILecturerParams extends IBaseQueryParams {
  // additional query parameters can be added here if needed
}
