import { IPaginationMeta } from '@/types/common';

export const getPaginationMeta = ({
  total,
  page = 1,
  limit = 10,
}: {
  total: number;
  page?: number;
  limit?: number;
}): IPaginationMeta => {
  const safeLimit = limit > 0 ? limit : 10;

  return {
    total,
    perPage: safeLimit,
    currentPage: page,
    lastPage: Math.ceil(total / safeLimit),
  };
};
