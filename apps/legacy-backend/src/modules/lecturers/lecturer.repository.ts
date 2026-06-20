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

    const baseQuery = db('DM_GiangVien as gv');

    baseQuery.whereRaw(`
      gv.IsChamDutHopDong = 0
      OR gv.IsChamDutHopDong IS NULL
    `);

    if (params.departmentId) {
      baseQuery.where('gv.IDKhoa', params.departmentId);
    }

    if (params.courseCode) {
      baseQuery.join('TKB_MonHocGiangVien as mhg', 'gv.Id', 'mhg.IDGiangVien')
        .join('DM_MonHoc as mh', 'mhg.IDMonHoc', 'mh.Id')
        .where('mh.MaMonHoc', params.courseCode);
    }

    try {
      const totalRes = await baseQuery
        .clone()
        .clearSelect()
        .clearOrder()
        .count('gv.Id as total');

      const total = Number(totalRes[0].total || 0);

      const rawData = await baseQuery
        .orderBy('gv.Id', 'asc')
        .limit(limit)
        .offset((page - 1) * limit)
        .select(
          'gv.Id as id',
          'gv.MaGiangVien as lecturerCode',
          'gv.NgaySinh as dateOfBirth',
          'gv.HoDem as lastName',
          'gv.Ten as firstName',
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
