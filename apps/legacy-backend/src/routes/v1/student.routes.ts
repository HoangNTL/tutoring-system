import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { StudentController } from '@/controllers/v1/StudentController';
import { studentSchema } from '@/validations/commonValidation';
import { StudentService } from '@/services/StudentService';
import { StudentRepository } from '@/repositories/StudentRepository';

const router = Router();

const studentRepository = new StudentRepository();
const studentService = new StudentService(studentRepository);
const studentController = new StudentController(studentService);

router.get('/', validate(studentSchema), studentController.getAllStudents);

export default router;
