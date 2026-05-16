import axios from 'axios'

import type { BaseResponse } from '@/shared/types/api'

const getFirstValidationError = (errors: unknown): string | null => {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
    return null
  }

  const firstError = Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [String(value)]))
    .find(Boolean)

  return firstError ?? null
}

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.'
) => {
  if (axios.isAxiosError<BaseResponse<never>>(error)) {
    const responseData = error.response?.data
    const validationError = getFirstValidationError(responseData?.errors)

    if (validationError) {
      return validationError
    }

    if (responseData?.message) {
      return responseData.message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}
