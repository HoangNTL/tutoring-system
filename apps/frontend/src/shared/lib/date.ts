import { format, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh'

const DISPLAY_DATE_FORMAT = 'dd/MM/yy'
const DATE_VALUE_FORMAT = 'yyyy-MM-dd'
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

const parseDateOnlyValue = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

const parseDateTimeValue = (value: string): Date => {
  if (DATE_TIME_PATTERN.test(value)) {
    return parseISO(value.replace(' ', 'T') + '+07:00')
  }

  return parseISO(value)
}

export const parseDateValue = (date?: string | Date | null): Date | null => {
  if (!date) {
    return null
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : new Date(date.getTime())
  }

  const normalizedValue = date.trim()

  if (!normalizedValue) {
    return null
  }

  if (DATE_ONLY_PATTERN.test(normalizedValue)) {
    const parsedDate = parseDateOnlyValue(normalizedValue)

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  const parsedDate = parseDateTimeValue(normalizedValue)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export const toDateValue = (date?: string | Date | null): string => {
  if (!date) {
    return ''
  }

  if (typeof date === 'string') {
    const normalizedValue = date.trim()

    if (!normalizedValue) {
      return ''
    }

    if (DATE_ONLY_PATTERN.test(normalizedValue)) {
      return normalizedValue
    }

    const parsedDate = parseDateTimeValue(normalizedValue)

    if (Number.isNaN(parsedDate.getTime())) {
      return ''
    }

    return formatInTimeZone(parsedDate, VIETNAM_TIME_ZONE, DATE_VALUE_FORMAT)
  }

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return format(date, DATE_VALUE_FORMAT)
}

export const formatDate = (date?: string | Date | null): string => {
  if (!date) {
    return ''
  }

  if (typeof date === 'string') {
    const normalizedValue = date.trim()

    if (!normalizedValue) {
      return ''
    }

    if (DATE_ONLY_PATTERN.test(normalizedValue)) {
      return format(parseDateOnlyValue(normalizedValue), DISPLAY_DATE_FORMAT)
    }

    const parsedDate = parseDateTimeValue(normalizedValue)

    if (Number.isNaN(parsedDate.getTime())) {
      return ''
    }

    return formatInTimeZone(parsedDate, VIETNAM_TIME_ZONE, DISPLAY_DATE_FORMAT)
  }

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return format(date, DISPLAY_DATE_FORMAT)
}
