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

export interface StudentInfo {
  studentCode: string;
  lastName: string;
  firstName: string;
  fullName: string;
}
