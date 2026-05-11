import { ITest, ITestParams } from '@/models/Test';
import { TestRepository } from '@/repositories/TestRepository';
import { IPaginationMeta } from '@/types/common';

export class TestService {
  constructor(private testRepository: TestRepository) {}

  async getTestData(
    params: ITestParams,
  ): Promise<{ data: ITest[]; meta: IPaginationMeta }> {
    // business logic can be added here if needed

    const testData = await this.testRepository.getTestData(params);

    return testData;
  }
}
