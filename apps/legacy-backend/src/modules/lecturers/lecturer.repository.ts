import { db } from '@/config/database';
import { getPaginationMeta } from '@/shared/pagination';
import { PaginationMeta } from '@/shared/types';

import {
  Lecturer,
  LecturerQueryParams,
} from '@/modules/lecturers/lecturer.types';

export class LecturerRepository {
  async getAll(
    params: LecturerQueryParams,
  ): Promise<{ data: Lecturer[]; meta: PaginationMeta }> {
    const { page, limit } = params;

    const baseQuery = db('DM_GiangVien');

    baseQuery.whereRaw(`
      IsChamDutHopDong = 0
      OR IsChamDutHopDong IS NULL
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
        'MaGiangVien as lecturerCode',
        'NgaySinh as dateOfBirth',
      );

    return {
      data,
      meta: getPaginationMeta({ total, page, limit }),
    };
  }
}
