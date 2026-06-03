import { db } from '@/config/database';
import { Period } from '@/modules/periods/period.types';
import { AppError } from '@/shared/errors';

export class PeriodRepository {
  async getAll(): Promise<Period[]> {
    try {
      return await db('DM_Dot')
        .orderBy('Id', 'desc')
        .select('Id as id', 'TenDot as name');
    } catch (error) {
      throw new AppError('Failed to fetch legacy periods', 500);
    }
  }
}
