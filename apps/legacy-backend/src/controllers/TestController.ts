import { Request, Response } from 'express';
import { TestService } from '../services/TestService';
import { ApiResponse } from '../utils/ApiResponse';
import { ITestParams } from '../models/Test';
import logger from '../utils/logger';

export class TestController {
  constructor(private testService: TestService) {}

  getTestData = async (req: Request, res: Response): Promise<Response> => {
    try {
      const params = req.query as unknown as ITestParams;

      const result = await this.testService.getTestData(params);

      return ApiResponse.success(
        res,
        result.data,
        'Test data fetched successfully',
        result.meta,
      );
    } catch (error) {
      // console.error('Error fetching test data:', error);
      logger.error('[TestController] Failed to fetch test data:', error);
      return ApiResponse.error(res, 'Error fetching test data', 500);
    }
  };
}
