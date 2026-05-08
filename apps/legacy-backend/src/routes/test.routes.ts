import { Router } from 'express';
import { TestController } from '../controllers/TestController';
import { TestService } from '../services/TestService';
import { TestRepository } from '../repositories/TestRepository';
import { validate } from '../middlewares/validate';
import { testSchema } from '../validations/commonValidation';

const router = Router();

const testRepository = new TestRepository();
const testService = new TestService(testRepository);
const testController = new TestController(testService);

router.get('/', validate(testSchema), testController.getTestData);

export default router;
