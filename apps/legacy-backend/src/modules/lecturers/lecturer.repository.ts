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
        'HoDem as lastName',
        'Ten as firstName',
        'NgaySinh as dateOfBirth',
      );

    const mappedData = data.map((lecturer) => {
      const lastName = String(lecturer.lastName ?? '').trim();
      const firstName = String(lecturer.firstName ?? '').trim();
      const lecturerName = `${lastName} ${firstName}`.trim();

      return {
        id: Number(lecturer.id),
        lecturerCode: String(lecturer.lecturerCode ?? '').trim(),
        lecturerName:
          lecturerName !== ''
            ? lecturerName
            : String(lecturer.lecturerCode ?? '').trim(),
        dateOfBirth: String(lecturer.dateOfBirth ?? ''),
      };
    });

    return {
      data: mappedData,
      meta: getPaginationMeta({ total, page, limit }),
    };
  }
}
