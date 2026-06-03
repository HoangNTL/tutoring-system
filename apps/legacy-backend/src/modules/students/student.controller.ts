import { Request, Response } from 'express';

import { StudentRepository } from '@/modules/students/student.repository';
import { StudentQueryParams } from '@/modules/students/student.types';
import { errorResponse, successResponse } from '@/shared/response';

export class StudentController {
  constructor(private readonly studentRepository: StudentRepository) {}

  getAllStudents = async (req: Request, res: Response): Promise<Response> => {
    const params = req.query as unknown as StudentQueryParams;
    const result = await this.studentRepository.getAll(params);

    return successResponse(
      res,
      result.data,
      'Students fetched successfully',
      result.meta,
    );
  };

  getCoursesByStudentId = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const studentId = Number.parseInt(String(req.params.studentId), 10);
    const periodId = Number.parseInt(String(req.params.periodId), 10);

    if (!Number.isInteger(studentId) || studentId < 1 || !Number.isInteger(periodId) || periodId < 1) {
      return errorResponse(res, 'Invalid studentId or periodId', 400);
    }

    const courses = await this.studentRepository.getCoursesByStudentId(
      studentId,
      periodId,
    );

    return successResponse(res, courses, 'Student courses fetched successfully');
  };

  getCoursesByStudentCode = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const studentCode = String(req.params.studentCode ?? '').trim();
    const periodId = Number.parseInt(String(req.params.periodId), 10);

    if (studentCode === '' || !Number.isInteger(periodId) || periodId < 1) {
      return errorResponse(res, 'Invalid studentCode or periodId', 400);
    }

    const courses = await this.studentRepository.getCoursesByStudentCode(
      studentCode,
      periodId,
    );

    return successResponse(res, courses, 'Student courses fetched successfully');
  };

  getStudentInfoById = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const studentId = Number.parseInt(String(req.params.studentId), 10);

    if (!Number.isInteger(studentId) || studentId < 1) {
      return errorResponse(res, 'Invalid studentId', 400);
    }

    const student = await this.studentRepository.getStudentInfoById(studentId);

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    return successResponse(res, student, 'Student fetched successfully');
  };

  getStudentInfoByCode = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const studentCode = String(req.params.studentCode ?? '').trim();

    if (studentCode === '') {
      return errorResponse(res, 'Invalid studentCode', 400);
    }

    const student = await this.studentRepository.getStudentInfoByCode(studentCode);

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    return successResponse(res, student, 'Student fetched successfully');
  };
}
