import { IBaseQueryParams } from '../types/common';

export interface ITest {
  id: number;
  studentCode: string;
  fullName: string;
  gender: string;
  dateOfBirth: Date;
  email: string;
}

export interface ITestParams extends IBaseQueryParams {
  // additional query parameters can be added here if needed
}
