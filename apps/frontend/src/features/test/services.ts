import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../api/axiosInstance'
import type { BaseResponse } from '../../types/common'

const fetchTest = async (
  page: number,
  limit: number
): Promise<BaseResponse<any>> => {
  const { data } = await axiosInstance.get('/test', {
    params: {
      page,
      limit
    }
  })
  return data
}

export const useGetTest = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['test', page, limit],
    queryFn: () => fetchTest(page, limit),
    staleTime: 5 * 1000,
  });
};
