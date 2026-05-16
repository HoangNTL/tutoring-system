export const AUTH_API_ENDPOINTS = {
  csrfCookie: '/sanctum/csrf-cookie',
  login: '/api/v1/auth/login',
  logout: '/api/v1/auth/logout',
  me: '/api/v1/auth/me',
} as const
