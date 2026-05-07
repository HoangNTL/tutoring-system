import Joi from 'joi';

export const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};

export const testSchema = Joi.object({
    ...paginationSchema,

    // seach
    // filter
    // sort
})