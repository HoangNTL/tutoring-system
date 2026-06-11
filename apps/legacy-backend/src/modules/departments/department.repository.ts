import { db, shouldUseDatabaseFallback } from '@/config/database';
import { getPaginationMeta } from '@/shared/pagination';
import { PaginationMeta } from '@/shared/types';

import {
  Department,
  DepartmentQueryParams,
} from '@/modules/departments/department.types';

export class DepartmentRepository {
  async getAll(
    params: DepartmentQueryParams,
  ): Promise<{ data: Department[]; meta: PaginationMeta }> {
    const { page, limit } = params;

    if (shouldUseDatabaseFallback()) {
      return {
        data: [],
        meta: getPaginationMeta({ total: 0, page, limit }),
      };
    }

    const baseQuery = db('TMP_DsBoMonKhoa');

    try {
      const totalRes = await baseQuery
        .clone()
        .clearSelect()
        .clearOrder()
        .count('Id as total');

      const total = Number(totalRes[0].total || 0);

      const data = await baseQuery
        .orderBy('Id', 'asc')
        .limit(limit)
        .offset((page - 1) * limit)
        .select('Id as id', 'TenBoMon as name');

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
}
