import { db } from '@/config/database';
import { IStudent, IStudentParams } from '@/models/Student';
import { IPaginationMeta } from '@/types/common';
import { getPaginationMeta } from '@/utils/PaginationHelper';

export class StudentRepository {
  async getAll(
    params: IStudentParams,
  ): Promise<{ data: IStudent[]; meta: IPaginationMeta }> {
    const { page, limit } = params;

    const baseQuery = db('DT_SinhVien');

    // filter
    // nam hoc hien tai (2024)
    baseQuery.whereRaw(`
        TRIM(QuocTich) <> ''
        AND QuocTich <> N'Việt Nam'
        AND YEAR(NgayNhapHoc) + 6 > 2024
    `);

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
