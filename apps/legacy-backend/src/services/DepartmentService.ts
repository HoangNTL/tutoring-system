import { IDepartmentParams, IDepartment } from '@/models/Department';
import { DepartmentRepository } from '@/repositories/DepartmentRepository';
import { IPaginationMeta } from '@/types/common';

export class DepartmentService {
  constructor(private departmentRepository: DepartmentRepository) {}

  async getAllDepartments(
    params: IDepartmentParams,
  ): Promise<{ data: IDepartment[]; meta: IPaginationMeta }> {
    return await this.departmentRepository.getAll(params);
  }
}
