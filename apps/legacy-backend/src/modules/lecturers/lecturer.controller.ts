import { Request, Response } from 'express';

import { LecturerRepository } from '@/modules/lecturers/lecturer.repository';
import { LecturerQueryParams } from '@/modules/lecturers/lecturer.types';
import { successResponse } from '@/shared/response';

export class LecturerController {
  constructor(private readonly lecturerRepository: LecturerRepository) {}

  getAllLecturers = async (req: Request, res: Response): Promise<Response> => {
    const params = req.query as unknown as LecturerQueryParams;
    const result = await this.lecturerRepository.getAll(params);

    return successResponse(
      res,
      result.data,
      'Lecturers fetched successfully',
      result.meta,
    );
  };
}
