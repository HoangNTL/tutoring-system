import type { User } from '@/features/auth/types'

const AUTH_USER_STORAGE_KEY = 'auth_user'
const AUTH_ROLES = new Set(['ADMIN', 'DEPARTMENT', 'LECTURER', 'STUDENT'])

const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<User>

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.username === 'string' &&
    typeof candidate.role === 'string' &&
    AUTH_ROLES.has(candidate.role)
  )
}

export const getStoredAuthUser = (): User | null => {
  const rawValue = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue)

    if (!isUser(parsedValue)) {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
      return null
    }

    return parsedValue
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    return null
  }
}

export const storeAuthUser = (user: User): void => {
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export const clearStoredAuthUser = (): void => {
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}
