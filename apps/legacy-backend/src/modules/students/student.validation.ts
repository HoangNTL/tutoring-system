import Joi from 'joi';

import { paginationSchema } from '@/shared/pagination';

export const studentQuerySchema = Joi.object({
  ...paginationSchema,
});
