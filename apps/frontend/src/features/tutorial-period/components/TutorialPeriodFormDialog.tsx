import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type {
  TutorialPeriod,
  TutorialPeriodPayload,
} from '@/features/tutorial-period/types'

const tutorialPeriodFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Tiêu đề là bắt buộc').max(255, 'Tiêu đề tối đa 255 ký tự'),
    description: z.string().trim().min(1, 'Mô tả là bắt buộc'),
    start_reg_date: z.string().min(1, 'Ngày bắt đầu đăng ký là bắt buộc'),
    end_reg_date: z.string().min(1, 'Ngày kết thúc đăng ký là bắt buộc'),
    start_study_date: z.string().min(1, 'Ngày bắt đầu học là bắt buộc'),
    end_study_date: z.string().min(1, 'Ngày kết thúc học là bắt buộc'),
  })
  .refine(
    (values) => new Date(values.start_reg_date) < new Date(values.end_reg_date),
    {
      message: 'Ngày bắt đầu đăng ký phải trước ngày kết thúc đăng ký',
      path: ['end_reg_date'],
    }
  )
  .refine(
    (values) => new Date(values.start_study_date) <= new Date(values.end_study_date),
    {
      message: 'Ngày bắt đầu học phải trước hoặc bằng ngày kết thúc học',
      path: ['end_study_date'],
    }
  )

type TutorialPeriodFormValues = z.infer<typeof tutorialPeriodFormSchema>

const defaultValues: TutorialPeriodFormValues = {
  title: '',
  description: '',
  start_reg_date: '',
  end_reg_date: '',
  start_study_date: '',
  end_study_date: '',
}

interface TutorialPeriodFormDialogProps {
  mode: 'create' | 'edit'
  open: boolean
  tutorialPeriod: TutorialPeriod | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TutorialPeriodPayload) => Promise<void>
}

const getInitialValues = (
  tutorialPeriod: TutorialPeriod | null
): TutorialPeriodFormValues => {
  if (!tutorialPeriod) {
    return defaultValues
  }

  return {
    title: tutorialPeriod.title,
    description: tutorialPeriod.description,
    start_reg_date: tutorialPeriod.start_reg_date,
    end_reg_date: tutorialPeriod.end_reg_date,
    start_study_date: tutorialPeriod.start_study_date,
    end_study_date: tutorialPeriod.end_study_date,
  }
}

export function TutorialPeriodFormDialog({
  mode,
  open,
  tutorialPeriod,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: TutorialPeriodFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TutorialPeriodFormValues>({
    resolver: zodResolver(tutorialPeriodFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset(getInitialValues(tutorialPeriod))
  }, [open, reset, tutorialPeriod])

  const title =
    mode === 'create' ? 'Tạo đợt phụ đạo' : 'Cập nhật đợt phụ đạo'
  const description =
    mode === 'create'
      ? 'Tạo mới một đợt phụ đạo và lưu ngay trên màn hình hiện tại.'
      : 'Cập nhật thông tin đợt phụ đạo đang ở trạng thái DRAFT.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90vh,44rem)] max-w-2xl flex-col overflow-hidden p-0">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="tutorial-period-title">Tiêu đề</Label>
                <Input
                  id="tutorial-period-title"
                  placeholder="Ví dụ: Đợt phụ đạo học kỳ 1"
                  disabled={isSubmitting}
                  {...register('title')}
                />
                {errors.title ? (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tutorial-period-description">Mô tả</Label>
                <Textarea
                  id="tutorial-period-description"
                  placeholder="Mô tả ngắn cho đợt phụ đạo"
                  disabled={isSubmitting}
                  {...register('description')}
                />
                {errors.description ? (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="tutorial-period-start-reg-date">
                    Bắt đầu đăng ký
                  </Label>
                  <Input
                    id="tutorial-period-start-reg-date"
                    type="date"
                    disabled={isSubmitting}
                    {...register('start_reg_date')}
                  />
                  {errors.start_reg_date ? (
                    <p className="text-sm text-red-500">
                      {errors.start_reg_date.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tutorial-period-end-reg-date">
                    Kết thúc đăng ký
                  </Label>
                  <Input
                    id="tutorial-period-end-reg-date"
                    type="date"
                    disabled={isSubmitting}
                    {...register('end_reg_date')}
                  />
                  {errors.end_reg_date ? (
                    <p className="text-sm text-red-500">
                      {errors.end_reg_date.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="tutorial-period-start-study-date">
                    Bắt đầu học
                  </Label>
                  <Input
                    id="tutorial-period-start-study-date"
                    type="date"
                    disabled={isSubmitting}
                    {...register('start_study_date')}
                  />
                  {errors.start_study_date ? (
                    <p className="text-sm text-red-500">
                      {errors.start_study_date.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tutorial-period-end-study-date">
                    Kết thúc học
                  </Label>
                  <Input
                    id="tutorial-period-end-study-date"
                    type="date"
                    disabled={isSubmitting}
                    {...register('end_study_date')}
                  />
                  {errors.end_study_date ? (
                    <p className="text-sm text-red-500">
                      {errors.end_study_date.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 mt-auto shrink-0 rounded-none rounded-b-xl border-t border-slate-200 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Đang lưu...'
                : mode === 'create'
                  ? 'Tạo đợt phụ đạo'
                  : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
