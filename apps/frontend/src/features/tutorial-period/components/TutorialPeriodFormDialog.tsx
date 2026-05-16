import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/shared/ui/button'
import { DatePickerField } from '@/shared/ui/date-picker-field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Spinner } from '@/shared/ui/spinner'
import { Textarea } from '@/shared/ui/textarea'
import type { TutorialPeriod } from '@/features/tutorial-period/types/tutorialPeriod.types'
import {
  getTutorialPeriodFormValues,
  tutorialPeriodFormDefaultValues,
  tutorialPeriodFormSchema,
  type TutorialPeriodFormValues,
} from '@/features/tutorial-period/schemas/tutorialPeriod.schema'

interface TutorialPeriodFormDialogProps {
  mode: 'create' | 'edit'
  open: boolean
  tutorialPeriod: TutorialPeriod | null
  isSubmitting: boolean
  submitError?: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TutorialPeriodFormValues) => Promise<void>
}

export function TutorialPeriodFormDialog({
  mode,
  open,
  tutorialPeriod,
  isSubmitting,
  submitError,
  onOpenChange,
  onSubmit,
}: TutorialPeriodFormDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TutorialPeriodFormValues>({
    resolver: zodResolver(tutorialPeriodFormSchema),
    defaultValues: tutorialPeriodFormDefaultValues,
  })

  useEffect(() => {
    if (!open) {
      return
    }

    reset(getTutorialPeriodFormValues(tutorialPeriod))
  }, [open, reset, tutorialPeriod])

  const title =
    mode === 'create' ? 'Tạo đợt phụ đạo' : 'Cập nhật đợt phụ đạo'
  const description =
    mode === 'create'
      ? 'Tạo mới một đợt phụ đạo và lưu ngay trên màn hình hiện tại.'
      : 'Cập nhật thông tin đợt phụ đạo đang ở trạng thái DRAFT.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-xl">
        <form
          className="flex min-h-0 flex-col"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
        >
          <DialogHeader className="gap-1 border-b border-slate-200 px-6 pb-4 pt-6">
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {submitError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600"
                >
                  {submitError}
                </div>
              ) : null}

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="tutorial-period-title"
                    className="text-sm font-medium text-slate-700"
                  >
                    Tiêu đề
                  </Label>
                  <Input
                    id="tutorial-period-title"
                    placeholder="Ví dụ: Đợt phụ đạo học kỳ 1"
                    disabled={isSubmitting}
                    className="h-10 rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none placeholder:text-slate-400"
                    {...register('title')}
                  />
                  {errors.title ? (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="tutorial-period-description"
                    className="text-sm font-medium text-slate-700"
                  >
                    Mô tả
                  </Label>
                  <Textarea
                    id="tutorial-period-description"
                    placeholder="Tóm tắt ngắn gọn cho đợt phụ đạo"
                    disabled={isSubmitting}
                    className="min-h-28 rounded-xl border-slate-200 bg-white px-3 py-2.5 leading-6 shadow-none placeholder:text-slate-400"
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
                    <Label
                      htmlFor="tutorial-period-start-reg-date"
                      className="text-sm font-medium text-slate-700"
                    >
                      Bắt đầu đăng ký
                    </Label>
                    <Controller
                      control={control}
                      name="startRegDate"
                      render={({ field }) => (
                        <DatePickerField
                          id="tutorial-period-start-reg-date"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Chọn ngày"
                          error={errors.startRegDate?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="tutorial-period-end-reg-date"
                      className="text-sm font-medium text-slate-700"
                    >
                      Kết thúc đăng ký
                    </Label>
                    <Controller
                      control={control}
                      name="endRegDate"
                      render={({ field }) => (
                        <DatePickerField
                          id="tutorial-period-end-reg-date"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Chọn ngày"
                          error={errors.endRegDate?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="tutorial-period-start-study-date"
                      className="text-sm font-medium text-slate-700"
                    >
                      Bắt đầu học
                    </Label>
                    <Controller
                      control={control}
                      name="startStudyDate"
                      render={({ field }) => (
                        <DatePickerField
                          id="tutorial-period-start-study-date"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Chọn ngày"
                          error={errors.startStudyDate?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="tutorial-period-end-study-date"
                      className="text-sm font-medium text-slate-700"
                    >
                      Kết thúc học
                    </Label>
                    <Controller
                      control={control}
                      name="endStudyDate"
                      render={({ field }) => (
                        <DatePickerField
                          id="tutorial-period-end-study-date"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Chọn ngày"
                          error={errors.endStudyDate?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 mt-auto shrink-0 rounded-none border-t border-slate-200 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="min-w-24 rounded-xl border-slate-200 bg-white px-4 shadow-none"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-40 rounded-xl bg-[#0f4c81] px-5 text-white shadow-none hover:bg-[#0c3d68]"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Đang lưu...
                </>
              ) : mode === 'create' ? (
                'Tạo đợt phụ đạo'
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
