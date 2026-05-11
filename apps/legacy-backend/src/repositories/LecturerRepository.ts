import { db } from '@/config/database';
import { ILecturer, ILecturerParams } from '@/models/Leturer';
import { IPaginationMeta } from '@/types/common';
import { getPaginationMeta } from '@/utils/PaginationHelper';

export class LecturerRepository {
  async getAll(
    params: ILecturerParams,
  ): Promise<{ data: ILecturer[]; meta: IPaginationMeta }> {
    const { page, limit } = params;

    const baseQuery = db('DM_GiangVien');

    // filter
    // giang vien chua cham dut hop dong
    baseQuery.whereRaw(`
        IsChamDutHopDong = 0 
        OR IsChamDutHopDong IS NULL
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
        'MaGiangVien as lecturerCode',
        'NgaySinh as dateOfBirth',
      );

    return {
      data,
      meta: getPaginationMeta({ total, page, limit }),
    };
  }
}
