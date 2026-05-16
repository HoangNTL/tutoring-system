import axios from 'axios'

import { store } from '@/app/store/store'
import { clearAuth } from '@/features/auth/authSlice'
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
  (error) => {
    if (error.response?.status === 401 && !isPublicAuthRequest(error.config?.url)) {
      queryClient.clear()
      store.dispatch(clearAuth())
    }

    return Promise.reject(error)
  }
)

export default http
