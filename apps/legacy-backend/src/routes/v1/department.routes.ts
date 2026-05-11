import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { departmentSchema } from '@/validations/commonValidation';
import { DepartmentRepository } from '@/repositories/DepartmentRepository';
import { DepartmentService } from '@/services/DepartmentService';
import { DepartmentController } from '@/controllers/v1/DepartmentController';

const router = Router();

const departmentRepository = new DepartmentRepository();
const departmentService = new DepartmentService(departmentRepository);
const departmentController = new DepartmentController(departmentService);

router.get(
  '/',
  validate(departmentSchema),
  departmentController.getAllDepartments,
);

export default router;
