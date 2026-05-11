import { Request, Response } from 'express';

import { ApiResponse } from '@/utils/ApiResponse';
import { LecturerService } from '@/services/LecturerService';
import { ILecturerParams } from '@/models/Leturer';
import { AppError } from '@/utils/AppError';

export class LecturerController {
  constructor(private lecturerService: LecturerService) {}

  getAllLecturers = async (req: Request, res: Response): Promise<Response> => {
    const params = req.query as unknown as ILecturerParams;

    const result = await this.lecturerService.getAllLecturers(params);

    if (!result) {
      throw new AppError('Lecturers not found', 404);
    }

    return ApiResponse.success(
      res,
      result.data,
      'Lecturers fetched successfully',
      result.meta,
    );
  };
}
