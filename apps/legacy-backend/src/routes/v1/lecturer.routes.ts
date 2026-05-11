import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { lecturerSchema } from '@/validations/commonValidation';
import { LecturerController } from '@/controllers/v1/LecturerController';
import { LecturerRepository } from '@/repositories/LecturerRepository';
import { LecturerService } from '@/services/LecturerService';

const router = Router();

const lecturerRepository = new LecturerRepository();
const lecturerService = new LecturerService(lecturerRepository);
const lecturerController = new LecturerController(lecturerService);

router.get('/', validate(lecturerSchema), lecturerController.getAllLecturers);

export default router;
