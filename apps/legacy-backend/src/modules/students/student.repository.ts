import { db, shouldUseDatabaseFallback } from '@/config/database';
import { getPaginationMeta } from '@/shared/pagination';
import { PaginationMeta } from '@/shared/types';

import {
  Student,
  StudentCourse,
  StudentInfo,
  StudentQueryParams,
} from '@/modules/students/student.types';

export class StudentRepository {
  async getAll(
    params: StudentQueryParams,
  ): Promise<{ data: Student[]; meta: PaginationMeta }> {
    const { page, limit } = params;

    if (shouldUseDatabaseFallback()) {
      return {
        data: [],
        meta: getPaginationMeta({ total: 0, page, limit }),
      };
    }

    const baseQuery = db('DT_SinhVien');

    baseQuery.whereRaw(`
      TRIM(QuocTich) <> ''
      AND QuocTich <> N'Việt Nam'
    `);

    try {
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

  async getCoursesByStudentId(
    studentId: number,
    periodId: number,
  ): Promise<StudentCourse[]> {
    if (shouldUseDatabaseFallback()) {
      return [];
    }

    try {
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
    } catch (error) {
      if (shouldUseDatabaseFallback()) {
        return [];
      }

      throw error;
    }
  }

  async getCoursesByStudentCode(
    studentCode: string,
    periodId: number,
  ): Promise<StudentCourse[]> {
    if (shouldUseDatabaseFallback()) {
      return [];
    }

    try {
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
    } catch (error) {
      if (shouldUseDatabaseFallback()) {
        return [];
      }

      throw error;
    }
  }

  async getStudentInfoById(studentId: number): Promise<StudentInfo | null> {
    if (shouldUseDatabaseFallback()) {
      return null;
    }

    try {
      const student = await db('DT_SinhVien')
        .where('Id', studentId)
        .first(
          'MaSinhVien as studentCode',
          'HoDem as lastName',
          'Ten as firstName',
        );

      return this.mapStudentInfo(student);
    } catch (error) {
      if (shouldUseDatabaseFallback()) {
        return null;
      }

      throw error;
    }
  }

  async getStudentInfoByCode(studentCode: string): Promise<StudentInfo | null> {
    if (shouldUseDatabaseFallback()) {
      return null;
    }

    try {
      const student = await db('DT_SinhVien')
        .where('MaSinhVien', studentCode)
        .first(
          'MaSinhVien as studentCode',
          'HoDem as lastName',
          'Ten as firstName',
        );

      return this.mapStudentInfo(student);
    } catch (error) {
      if (shouldUseDatabaseFallback()) {
        return null;
      }

      throw error;
    }
  }

  private mapStudentInfo(student: unknown): StudentInfo | null {
    if (!student || typeof student !== 'object') {
      return null;
    }

    const data = student as {
      studentCode?: unknown;
      lastName?: unknown;
      firstName?: unknown;
    };

    const studentCode = String(data.studentCode ?? '').trim();

    if (studentCode === '') {
      return null;
    }

    const lastName = String(data.lastName ?? '').trim();
    const firstName = String(data.firstName ?? '').trim();
    const fullName = `${lastName} ${firstName}`.trim();

    return {
      studentCode,
      lastName,
      firstName,
      fullName,
    };
  }
}
