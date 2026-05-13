import type { BaseResponse } from "@/types/common";

export interface User {
  id: number;
  username: string;
  role: number;
  studentId: number | null;
  lecturerId: number | null;
  departmentId: number | null;
}

export interface LoginPayload {
  username: string;
  password: string;
  // remember?: boolean;
}

export type LoginResponse = BaseResponse<{
  user: User;
}>