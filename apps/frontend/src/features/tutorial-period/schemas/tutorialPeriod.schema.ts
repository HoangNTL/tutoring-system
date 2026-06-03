import { z } from 'zod'

import type { TutorialPeriod } from '@/features/tutorial-period/types/tutorialPeriod.types'
import { parseDateValue, toDateValue } from '@/shared/lib/date'

const parseDate = (value: string) => parseDateValue(value)

export const tutorialPeriodFormSchema = z
  .object({
    academicPeriodId: z
      .number()
      .int('Học kỳ phải là số nguyên dương')
      .min(1, 'Học kỳ là bắt buộc'),
    title: z
      .string()
      .trim()
      .min(1, 'Tiêu đề là bắt buộc')
      .max(255, 'Tiêu đề tối đa 255 ký tự'),
    description: z.string().trim(),
    registrationStartAt: z.string().min(1, 'Ngày bắt đầu đăng ký là bắt buộc'),
    registrationEndAt: z.string().min(1, 'Ngày kết thúc đăng ký là bắt buộc'),
    studyStartAt: z.string().min(1, 'Ngày bắt đầu học là bắt buộc'),
    studyEndAt: z.string().min(1, 'Ngày kết thúc học là bắt buộc'),
  })
  .superRefine((values, context) => {
    const registrationStartAt = parseDate(values.registrationStartAt)
    const registrationEndAt = parseDate(values.registrationEndAt)
    const studyStartAt = parseDate(values.studyStartAt)
    const studyEndAt = parseDate(values.studyEndAt)

    if (
      registrationStartAt &&
      registrationEndAt &&
      registrationStartAt >= registrationEndAt
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Ngày bắt đầu đăng ký phải trước ngày kết thúc đăng ký',
        path: ['registrationEndAt'],
      })
    }

    if (
      registrationEndAt &&
      studyStartAt &&
      registrationEndAt >= studyStartAt
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Ngày kết thúc đăng ký phải trước ngày bắt đầu học',
        path: ['studyStartAt'],
      })
    }

    if (studyStartAt && studyEndAt && studyStartAt >= studyEndAt) {
      context.addIssue({
        code: 'custom',
        message: 'Ngày bắt đầu học phải trước ngày kết thúc học',
        path: ['studyEndAt'],
      })
    }
  })

export type TutorialPeriodFormValues = z.infer<typeof tutorialPeriodFormSchema>

export const tutorialPeriodFormDefaultValues: TutorialPeriodFormValues = {
  academicPeriodId: 0,
  title: '',
  description: '',
  registrationStartAt: '',
  registrationEndAt: '',
  studyStartAt: '',
  studyEndAt: '',
}

export const getTutorialPeriodFormValues = (
  tutorialPeriod: TutorialPeriod | null
): TutorialPeriodFormValues => {
  if (!tutorialPeriod) {
    return { ...tutorialPeriodFormDefaultValues }
  }

  return {
    academicPeriodId: tutorialPeriod.academicPeriodId ?? 0,
    title: tutorialPeriod.title,
    description: tutorialPeriod.description,
    registrationStartAt: toDateValue(tutorialPeriod.registrationStartAt),
    registrationEndAt: toDateValue(tutorialPeriod.registrationEndAt),
    studyStartAt: toDateValue(tutorialPeriod.studyStartAt),
    studyEndAt: toDateValue(tutorialPeriod.studyEndAt),
  }
}
