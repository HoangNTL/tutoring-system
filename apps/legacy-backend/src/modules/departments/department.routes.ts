import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { DepartmentController } from '@/modules/departments/department.controller';
import { DepartmentRepository } from '@/modules/departments/department.repository';
import { departmentQuerySchema } from '@/modules/departments/department.validation';

const departmentRouter = Router();

const departmentRepository = new DepartmentRepository();
const departmentController = new DepartmentController(departmentRepository);

departmentRouter.get(
  '/',
  validate(departmentQuerySchema),
  departmentController.getAllDepartments,
);

export default departmentRouter;
