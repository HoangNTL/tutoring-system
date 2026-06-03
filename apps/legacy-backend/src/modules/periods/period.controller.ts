import { Request, Response } from 'express';

import { PeriodRepository } from '@/modules/periods/period.repository';
import { successResponse } from '@/shared/response';

export class PeriodController {
  constructor(private readonly periodRepository: PeriodRepository) {}

  getAllPeriods = async (_req: Request, res: Response): Promise<Response> => {
    const periods = await this.periodRepository.getAll();

    return successResponse(res, periods, 'Legacy periods fetched successfully');
  };
}
