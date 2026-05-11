import { IStudent, IStudentParams } from '@/models/Student';
import { StudentRepository } from '@/repositories/StudentRepository';
import { IPaginationMeta } from '@/types/common';

export class StudentService {
  constructor(private studentRepository: StudentRepository) {}

  async getAllStudents(
    params: IStudentParams,
  ): Promise<{ data: IStudent[]; meta: IPaginationMeta }> {
    return await this.studentRepository.getAll(params);
  }
}
