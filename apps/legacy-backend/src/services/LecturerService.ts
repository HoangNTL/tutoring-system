import { ILecturer, ILecturerParams } from '@/models/Leturer';
import { LecturerRepository } from '@/repositories/LecturerRepository';
import { IPaginationMeta } from '@/types/common';

export class LecturerService {
  constructor(private lecturerRepository: LecturerRepository) {}

  async getAllLecturers(
    params: ILecturerParams,
  ): Promise<{ data: ILecturer[]; meta: IPaginationMeta }> {
    return await this.lecturerRepository.getAll(params);
  }
}
