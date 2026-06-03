import { db } from '@/config/database';
import { getPaginationMeta } from '@/shared/pagination';
import { PaginationMeta } from '@/shared/types';

import {
  Student,
  StudentCourse,
  StudentQueryParams,
} from '@/modules/students/student.types';

export class StudentRepository {
  async getAll(
    params: StudentQueryParams,
  ): Promise<{ data: Student[]; meta: PaginationMeta }> {
    const { page, limit } = params;

    const baseQuery = db('DT_SinhVien');

    baseQuery.whereRaw(`
      TRIM(QuocTich) <> ''
      AND QuocTich <> N'Việt Nam'
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

  async getCoursesByStudentId(
    studentId: number,
    periodId: number,
  ): Promise<StudentCourse[]> {
    const data = await db('DT_SinhVien as sv')
      .join('DT_KetQuaHocTapMonHoc as kq', 'sv.Id', 'kq.IDSinhVien')
      .join('TKB_LopHocPhan as lhp', 'kq.IDLopHocPhan', 'lhp.Id')
      .join('TKB_MonHoc as mh', 'mh.Id', 'lhp.IDMonHoc')
      .join('DM_Dot as dot', 'lhp.IDDot', 'dot.Id')
      .where('sv.Id', studentId)
      .andWhere('dot.Id', periodId)
      .distinct(
        'mh.MaMonHoc as courseCode',
        'mh.TenMonHoc as courseName',
        'mh.SoTinChi as credits',
      )
      .orderBy('mh.TenMonHoc', 'asc');

    return data.map((course) => ({
      courseCode: String(course.courseCode ?? ''),
      courseName: String(course.courseName ?? ''),
      credits: Number(course.credits ?? 0),
    }));
  }

  async getCoursesByStudentCode(
    studentCode: string,
    periodId: number,
  ): Promise<StudentCourse[]> {
    const data = await db('DT_SinhVien as sv')
      .join('DT_KetQuaHocTapMonHoc as kq', 'sv.Id', 'kq.IDSinhVien')
      .join('TKB_LopHocPhan as lhp', 'kq.IDLopHocPhan', 'lhp.Id')
      .join('TKB_MonHoc as mh', 'mh.Id', 'lhp.IDMonHoc')
      .join('DM_Dot as dot', 'lhp.IDDot', 'dot.Id')
      .where('sv.MaSinhVien', studentCode)
      .andWhere('dot.Id', periodId)
      .distinct(
        'mh.MaMonHoc as courseCode',
        'mh.TenMonHoc as courseName',
        'mh.SoTinChi as credits',
      )
      .orderBy('mh.TenMonHoc', 'asc');

    return data.map((course) => ({
      courseCode: String(course.courseCode ?? ''),
      courseName: String(course.courseName ?? ''),
      credits: Number(course.credits ?? 0),
    }));
  }
}
