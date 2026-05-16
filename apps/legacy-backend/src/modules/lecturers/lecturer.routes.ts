import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { LecturerController } from '@/modules/lecturers/lecturer.controller';
import { LecturerRepository } from '@/modules/lecturers/lecturer.repository';
import { lecturerQuerySchema } from '@/modules/lecturers/lecturer.validation';

const lecturerRouter = Router();

const lecturerRepository = new LecturerRepository();
const lecturerController = new LecturerController(lecturerRepository);

lecturerRouter.get(
  '/',
  validate(lecturerQuerySchema),
  lecturerController.getAllLecturers,
);

export default lecturerRouter;
