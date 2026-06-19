import { db, shouldUseDatabaseFallback } from '@/config/database';
import { getPaginationMeta } from '@/shared/pagination';
import { PaginationMeta } from '@/shared/types';

import {
  Department,
  DepartmentLecturer,
  DepartmentQueryParams,
} from '@/modules/departments/department.types';

export class DepartmentRepository {
  async getAll(
    params: DepartmentQueryParams,
  ): Promise<{ data: Department[]; meta: PaginationMeta }> {
    const { page, limit } = params;

    try {
      if (shouldUseDatabaseFallback()) {
        return {
          data: [],
          meta: getPaginationMeta({ total: 0, page, limit }),
        };
      }

      const baseQuery = db('TMP_DsBoMonKhoa');

    const totalRes = await baseQuery
      .clone()
      .clearSelect()
      .clearOrder()
      .count('IDBoMon as total');

      const total = Number(totalRes[0].total || 0);

    const data = await baseQuery
      .orderBy('IDBoMon', 'asc')
      .limit(limit)
      .offset((page - 1) * limit)
      .select('IDBoMon as id', 'TenBoMon as name');

      return {
        data,
        meta: getPaginationMeta({ total, page, limit }),
      };
    } catch (error) {
      if (shouldUseDatabaseFallback()) {
        return {
          data: [],
          meta: getPaginationMeta({ total: 0, page, limit }),
        };
      }

      throw error;
    }
  }

  async getLecturersByDepartment(
    departmentId: number,
  ): Promise<DepartmentLecturer[]> {
    const rows = await db('TMP_DsGVBoMon')
      .where('IDBoMon', departmentId)
      .orderBy('Ten', 'asc')
      .orderBy('HoDem', 'asc')
      .select(
        'Id as id',
        'MaNhanSu as code',
        'HoDem as lastName',
        'Ten as firstName',
        'TenBoMon as departmentName',
      );

    return rows
      .filter((row) => row.id !== null && row.id !== undefined)
      .map(
        (row): DepartmentLecturer => {
          const code = String(row.code ?? '').trim();
          const fullName =
            [row.lastName, row.firstName]
              .filter(Boolean)
              .join(' ')
              .trim() || code;

          return {
            id: Number(row.id),
            code,
            fullName,
            departmentName: String(row.departmentName ?? '').trim(),
          };
        },
      )
      .filter((lecturer) => lecturer.id > 0 && lecturer.code !== '');
  }
}
