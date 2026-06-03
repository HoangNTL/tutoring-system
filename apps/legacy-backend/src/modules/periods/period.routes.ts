import { Router } from 'express';

import { PeriodController } from '@/modules/periods/period.controller';
import { PeriodRepository } from '@/modules/periods/period.repository';

const periodRouter = Router();

const periodRepository = new PeriodRepository();
const periodController = new PeriodController(periodRepository);

periodRouter.get('/', periodController.getAllPeriods);

export default periodRouter;
