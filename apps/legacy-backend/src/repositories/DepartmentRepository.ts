import { db } from '@/config/database';
import { IDepartment, IDepartmentParams } from '@/models/Department';
import { IPaginationMeta } from '@/types/common';
import { getPaginationMeta } from '@/utils/PaginationHelper';

export class DepartmentRepository {
  async getAll(
    params: IDepartmentParams,
  ): Promise<{ data: IDepartment[]; meta: IPaginationMeta }> {
    const { page, limit } = params;

    const baseQuery = db('TMP_DsBoMonKhoa');

    // count total
    const totalRes = await baseQuery
      .clone()
      .clearSelect()
      .clearOrder()
      .count('Id as total');

    const total = Number(totalRes[0].total || 0);

    // data pagination
    const data = await baseQuery
      .orderBy('Id', 'asc')
      .limit(limit)
      .offset((page - 1) * limit)
      .select('id', 'TenBoMon as name');

    return {
      data,
      meta: getPaginationMeta({ total, page, limit }),
    };
  }
}
