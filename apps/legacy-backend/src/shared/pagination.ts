import Joi from 'joi';

import { PaginationMeta } from '@/shared/types';

export const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
};

export const getPaginationMeta = ({
  total,
  page = 1,
  limit = 10,
}: {
  total: number;
  page?: number;
  limit?: number;
}): PaginationMeta => {
  const safeLimit = limit > 0 ? limit : 10;

  return {
    total,
    perPage: safeLimit,
    currentPage: page,
    lastPage: Math.ceil(total / safeLimit),
  };
};
