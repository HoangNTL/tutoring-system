import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { StudentController } from '@/modules/students/student.controller';
import { StudentRepository } from '@/modules/students/student.repository';
import { studentQuerySchema } from '@/modules/students/student.validation';

const studentRouter = Router();

const studentRepository = new StudentRepository();
const studentController = new StudentController(studentRepository);

studentRouter.get(
  '/',
  validate(studentQuerySchema),
  studentController.getAllStudents,
);

export default studentRouter;
