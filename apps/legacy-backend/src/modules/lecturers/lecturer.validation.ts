import Joi from 'joi';

import { paginationSchema } from '@/shared/pagination';

export const lecturerQuerySchema = Joi.object({
  ...paginationSchema,
  departmentId: Joi.number().integer().optional(),
  courseCode: Joi.string().optional(),
});
