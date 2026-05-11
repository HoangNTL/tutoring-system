import { Request, Response } from 'express';

import { StudentService } from '@/services/StudentService';
import { IStudentParams } from '@/models/Student';
import { ApiResponse } from '@/utils/ApiResponse';
import { AppError } from '@/utils/AppError';

export class StudentController {
  constructor(private studentService: StudentService) {}

  getAllStudents = async (req: Request, res: Response): Promise<Response> => {
    const params = req.query as unknown as IStudentParams;

    const result = await this.studentService.getAllStudents(params);

    if (!result) {
      throw new AppError('Students not found', 404);
    }

    return ApiResponse.success(
      res,
      result.data,
      'Students fetched successfully',
      result.meta,
    );
  };
}
