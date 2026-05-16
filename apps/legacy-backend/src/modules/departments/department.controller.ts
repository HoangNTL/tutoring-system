import { Request, Response } from 'express';

import { DepartmentRepository } from '@/modules/departments/department.repository';
import { DepartmentQueryParams } from '@/modules/departments/department.types';
import { successResponse } from '@/shared/response';

export class DepartmentController {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  getAllDepartments = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const params = req.query as unknown as DepartmentQueryParams;
    const result = await this.departmentRepository.getAll(params);

    return successResponse(
      res,
      result.data,
      'Departments fetched successfully',
      result.meta,
    );
  };
}
