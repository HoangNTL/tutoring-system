import { Request, Response } from 'express';

import { StudentRepository } from '@/modules/students/student.repository';
import { StudentQueryParams } from '@/modules/students/student.types';
import { successResponse } from '@/shared/response';

export class StudentController {
  constructor(private readonly studentRepository: StudentRepository) {}

  getAllStudents = async (req: Request, res: Response): Promise<Response> => {
    const params = req.query as unknown as StudentQueryParams;
    const result = await this.studentRepository.getAll(params);

    return successResponse(
      res,
      result.data,
      'Students fetched successfully',
      result.meta,
    );
  };
}
