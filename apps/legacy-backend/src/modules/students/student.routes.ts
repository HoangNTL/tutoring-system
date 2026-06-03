import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { StudentController } from '@/modules/students/student.controller';
import { StudentRepository } from '@/modules/students/student.repository';
import { studentQuerySchema } from '@/modules/students/student.validation';

const studentRouter = Router();

const studentRepository = new StudentRepository();
const studentController = new StudentController(studentRepository);
export const studentLegacyRouter = Router();

studentRouter.get(
  '/',
  validate(studentQuerySchema),
  studentController.getAllStudents,
);

studentLegacyRouter.get(
  '/by-id/:studentId',
  studentController.getStudentInfoById,
);

studentLegacyRouter.get(
  '/by-code/:studentCode',
  studentController.getStudentInfoByCode,
);

studentLegacyRouter.get(
  '/by-id/:studentId/periods/:periodId/courses',
  studentController.getCoursesByStudentId,
);

studentLegacyRouter.get(
  '/by-code/:studentCode/periods/:periodId/courses',
  studentController.getCoursesByStudentCode,
);

export default studentRouter;
