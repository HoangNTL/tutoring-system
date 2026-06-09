import { Request, Response } from 'express';

import { DepartmentRepository } from '@/modules/departments/department.repository';
import { DepartmentQueryParams } from '@/modules/departments/department.types';
import { AppError } from '@/shared/errors';
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

  getLecturersByDepartment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const departmentId = Number(req.params.departmentId);

    if (!Number.isInteger(departmentId) || departmentId < 1) {
      throw new AppError('departmentId must be a positive integer', 400);
    }

    const lecturers = await this.departmentRepository.getLecturersByDepartment(
      departmentId,
    );

    return successResponse(
      res,
      lecturers,
      'Department lecturers fetched successfully',
    );
  };
}
