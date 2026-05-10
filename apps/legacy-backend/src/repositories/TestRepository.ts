import { db } from '@/config/database';
import { ITest, ITestParams } from '@/models/Test';
import { IPaginationMeta } from '@/types/common';
import { getPaginationMeta } from '@/utils/PaginationHelper';

export class TestRepository {
  async getTestData(
    params: ITestParams,
  ): Promise<{ data: ITest[]; meta: IPaginationMeta }> {
    const { page, limit } = params;

    const baseQuery = db('DT_SinhVien');

    // search

    // filter

    // count total records for pagination
    const totalRes = await baseQuery.clone().count('Id as total');
    const total = Number(totalRes[0].total) || 0;

    // sorting and pagination
    const data = await baseQuery
      .orderBy('Id', 'asc')
      .limit(limit)
      .offset((page - 1) * limit)
      .select(
        'Id as id',
        'MaSinhVien as studentCode',
        db.raw("HoDem + ' ' + Ten as fullName"),
        'GioiTinh as gender',
        'NgaySinh as dateOfBirth',
        'Email as email',
      );

    return {
      data,
      meta: getPaginationMeta({ total, page, limit }),
    };
  }
}
