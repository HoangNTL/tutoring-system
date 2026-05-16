import axios, { type InternalAxiosRequestConfig } from 'axios'

import { AUTH_API_ENDPOINTS } from '@/features/auth/constants'
import { queryClient } from '@/shared/api/queryClient'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

type RetriableAxiosConfig = InternalAxiosRequestConfig & {
  _csrfRetried?: boolean
}

let onUnauthorized: (() => void) | null = null

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler
}

const isPublicAuthRequest = (url?: string) => {
  if (!url) {
    return false
  }

  return (
    url.includes(AUTH_API_ENDPOINTS.login) ||
    url.includes(AUTH_API_ENDPOINTS.csrfCookie)
  )
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableAxiosConfig | undefined

    if (
      error.response?.status === 419 &&
      originalRequest &&
      !originalRequest._csrfRetried &&
      !originalRequest.url?.includes(AUTH_API_ENDPOINTS.csrfCookie)
    ) {
      originalRequest._csrfRetried = true

      await axios.get(AUTH_API_ENDPOINTS.csrfCookie, {
        baseURL: http.defaults.baseURL,
        withCredentials: true,
        withXSRFToken: true,
        xsrfCookieName: http.defaults.xsrfCookieName,
        xsrfHeaderName: http.defaults.xsrfHeaderName,
        headers: {
          Accept: 'application/json',
        },
      })

      return http.request(originalRequest)
    }

    if (error.response?.status === 401 && !isPublicAuthRequest(error.config?.url)) {
      queryClient.clear()
      onUnauthorized?.()
    }

    return Promise.reject(error)
  }
)

export default http
