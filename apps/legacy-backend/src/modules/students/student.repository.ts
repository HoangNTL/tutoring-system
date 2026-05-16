import { db } from '@/config/database';
import { getPaginationMeta } from '@/shared/pagination';
import { PaginationMeta } from '@/shared/types';

import { Student, StudentQueryParams } from '@/modules/students/student.types';

export class StudentRepository {
  async getAll(
    params: StudentQueryParams,
  ): Promise<{ data: Student[]; meta: PaginationMeta }> {
    const { page, limit } = params;

    const baseQuery = db('DT_SinhVien');

    baseQuery.whereRaw(`
      TRIM(QuocTich) <> ''
      AND QuocTich <> N'Việt Nam'
      AND YEAR(NgayNhapHoc) + 6 > 2024
    `);

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
      .select(
        'Id as id',
        'MaSinhVien as studentCode',
        'NgaySinh2 as dateOfBirth',
      );

    return {
      data,
      meta: getPaginationMeta({ total, page, limit }),
    };
  }
}
