import Joi from 'joi';

import { paginationSchema } from '@/shared/pagination';

export const departmentQuerySchema = Joi.object({
  ...paginationSchema,
});
