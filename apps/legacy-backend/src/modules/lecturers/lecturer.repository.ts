import { db, shouldUseDatabaseFallback } from '@/config/database';
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

    if (shouldUseDatabaseFallback()) {
      return {
        data: [],
        meta: getPaginationMeta({ total: 0, page, limit }),
      };
    }

    const baseQuery = db('DM_GiangVien');

    baseQuery.whereRaw(`
      IsChamDutHopDong = 0
      OR IsChamDutHopDong IS NULL
    `);

    if (params.departmentId) {
      baseQuery.where('IDKhoa', params.departmentId);
    }

    try {
      const totalRes = await baseQuery
        .clone()
        .clearSelect()
        .clearOrder()
        .count('Id as total');

      const total = Number(totalRes[0].total || 0);

      const rawData = await baseQuery
        .orderBy('Id', 'asc')
        .limit(limit)
        .offset((page - 1) * limit)
        .select(
          'Id as id',
          'MaGiangVien as lecturerCode',
          'NgaySinh as dateOfBirth',
          'HoDem as lastName',
          'Ten as firstName',
        );

      const data = rawData.map((item: any) => ({
        id: item.id,
        lecturerCode: item.lecturerCode,
        dateOfBirth: item.dateOfBirth,
        firstName: item.firstName,
        lastName: item.lastName,
        fullName: [item.lastName, item.firstName].filter(Boolean).join(' ').trim(),
      }));

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
