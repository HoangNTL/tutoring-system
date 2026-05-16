import { z } from 'zod'

import type { TutorialPeriod } from '@/features/tutorial-period/types/tutorialPeriod.types'
import { parseDateValue, toDateValue } from '@/shared/lib/date'

const parseDate = (value: string) => parseDateValue(value)

export const tutorialPeriodFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Tiêu đề là bắt buộc')
      .max(255, 'Tiêu đề tối đa 255 ký tự'),
    description: z.string().trim().min(1, 'Mô tả là bắt buộc'),
    startRegDate: z.string().min(1, 'Ngày bắt đầu đăng ký là bắt buộc'),
    endRegDate: z.string().min(1, 'Ngày kết thúc đăng ký là bắt buộc'),
    startStudyDate: z.string().min(1, 'Ngày bắt đầu học là bắt buộc'),
    endStudyDate: z.string().min(1, 'Ngày kết thúc học là bắt buộc'),
  })
  .superRefine((values, context) => {
    const startRegDate = parseDate(values.startRegDate)
    const endRegDate = parseDate(values.endRegDate)
    const startStudyDate = parseDate(values.startStudyDate)
    const endStudyDate = parseDate(values.endStudyDate)

    if (startRegDate && endRegDate && startRegDate >= endRegDate) {
      context.addIssue({
        code: 'custom',
        message: 'Ngày bắt đầu đăng ký phải trước ngày kết thúc đăng ký',
        path: ['endRegDate'],
      })
    }

    if (startStudyDate && endStudyDate && startStudyDate > endStudyDate) {
      context.addIssue({
        code: 'custom',
        message: 'Ngày bắt đầu học phải trước hoặc bằng ngày kết thúc học',
        path: ['endStudyDate'],
      })
    }
  })

export type TutorialPeriodFormValues = z.infer<typeof tutorialPeriodFormSchema>

export const tutorialPeriodFormDefaultValues: TutorialPeriodFormValues = {
  title: '',
  description: '',
  startRegDate: '',
  endRegDate: '',
  startStudyDate: '',
  endStudyDate: '',
}

export const getTutorialPeriodFormValues = (
  tutorialPeriod: TutorialPeriod | null
): TutorialPeriodFormValues => {
  if (!tutorialPeriod) {
    return { ...tutorialPeriodFormDefaultValues }
  }

  return {
    title: tutorialPeriod.title,
    description: tutorialPeriod.description,
    startRegDate: toDateValue(tutorialPeriod.startRegDate),
    endRegDate: toDateValue(tutorialPeriod.endRegDate),
    startStudyDate: toDateValue(tutorialPeriod.startStudyDate),
    endStudyDate: toDateValue(tutorialPeriod.endStudyDate),
  }
}
