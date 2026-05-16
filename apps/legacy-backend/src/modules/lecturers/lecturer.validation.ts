import Joi from 'joi';

import { paginationSchema } from '@/shared/pagination';

export const lecturerQuerySchema = Joi.object({
  ...paginationSchema,
});
