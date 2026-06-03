import { BaseQueryParams } from '@/shared/types';

export interface Student {
  id: number;
  studentCode: string;
  dateOfBirth: string;
}

export interface StudentQueryParams extends BaseQueryParams {}

export interface StudentCourse {
  courseCode: string;
  courseName: string;
  credits: number;
}
