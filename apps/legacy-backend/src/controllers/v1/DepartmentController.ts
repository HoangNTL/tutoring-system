import { Request, Response } from 'express';

import { ApiResponse } from '@/utils/ApiResponse';
import { DepartmentService } from '@/services/DepartmentService';
import { IDepartmentParams } from '@/models/Department';
import { AppError } from '@/utils/AppError';

export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  getAllDepartments = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const params = req.query as unknown as IDepartmentParams;

    const result = await this.departmentService.getAllDepartments(params);

    if (!result) {
      throw new AppError('Departments not found', 404);
    }

    return ApiResponse.success(
      res,
      result.data,
      'Departments fetched successfully',
      result.meta,
    );
  };
}
