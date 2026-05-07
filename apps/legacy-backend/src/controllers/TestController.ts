import { Request, Response } from 'express';
import { TestService } from '../services/TestService';
import { ApiResponse } from '../utils/ApiResponse';
import { ITestParams } from '../models/Test';
import { AppError } from '../utils/AppError';

export class TestController {
  constructor(private testService: TestService) {}

  getTestData = async (req: Request, res: Response): Promise<Response> => {

      const params = req.query as unknown as ITestParams;

      const result = await this.testService.getTestData(params);

      if (!result) throw new AppError('Data not found', 404);

      return ApiResponse.success(
        res,
        result.data,
        'Test data fetched successfully',
        result.meta,
      );
  };
}
