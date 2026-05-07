import { ITest, ITestParams } from '../models/Test';
import { TestRepository } from '../repositories/TestRepository';

export class TestService {
  constructor(private testRepository: TestRepository) {}

  async getTestData(
    params: ITestParams,
  ): Promise<{ data: ITest[]; meta: any }> {
    // business logic can be added here if needed

    const testData = await this.testRepository.getTestData(params);

    return testData;
  }
}
