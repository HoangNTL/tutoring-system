import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/shared/ui/button'
import { DatePickerField } from '@/shared/ui/date-picker-field'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Spinner } from '@/shared/ui/spinner'
import { Textarea } from '@/shared/ui/textarea'
import {
  tutorialPeriodStatuses,
  tutorialPeriodStatusLabels,
  type LegacyPeriod,
  type TutorialPeriod,
} from '@/features/tutorial-period/types/tutorialPeriod.types'
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
  legacyPeriods: LegacyPeriod[]
  isLegacyPeriodsLoading: boolean
  legacyPeriodsError?: string | null
  isSubmitting: boolean
  submitError?: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TutorialPeriodFormValues) => Promise<void>
}

export function TutorialPeriodFormDialog({
  mode,
  open,
  tutorialPeriod,
  legacyPeriods,
  isLegacyPeriodsLoading,
  legacyPeriodsError,
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

  const editableFields = new Set(tutorialPeriod?.permissions?.editableFields ?? [])
  const allowedStatuses =
    mode === 'create'
      ? tutorialPeriodStatuses
      : tutorialPeriod?.permissions?.allowedStatuses ?? []

  useEffect(() => {
    if (!open) {
      return
    }

    reset(getTutorialPeriodFormValues(tutorialPeriod))
  }, [open, reset, tutorialPeriod])

  const title =
    mode === 'create'
      ? 'Tạo đợt phụ đạo'
      : 'Cập nhật đợt phụ đạo'

  const canEditField = (field: keyof TutorialPeriodFormValues) =>
    mode === 'create' || editableFields.has(field)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-xl sm:max-w-3xl lg:max-w-4xl">
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
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              {submitError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600"
                >
                  {submitError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label
                    htmlFor="tutorial-period-academic-period-id"
                    className="text-sm font-medium text-slate-700"
                  >
                    Học kỳ
                  </Label>
                  <Controller
                    control={control}
                    name="academicPeriodId"
                    render={({ field }) => (
                      <Select
                        value={field.value > 0 ? field.value.toString() : undefined}
                        onValueChange={(value) => field.onChange(Number(value))}
                        disabled={
                          isSubmitting ||
                          isLegacyPeriodsLoading ||
                          !canEditField('academicPeriodId')
                        }
                      >
                        <SelectTrigger
                          id="tutorial-period-academic-period-id"
                          className="h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none"
                        >
                          <SelectValue
                            placeholder={
                              isLegacyPeriodsLoading
                                ? 'Đang tải học kỳ...'
                                : 'Chọn học kỳ'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {legacyPeriods.map((legacyPeriod) => (
                            <SelectItem
                              key={legacyPeriod.id}
                              value={legacyPeriod.id.toString()}
                            >
                              {legacyPeriod.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.academicPeriodId ? (
                    <p className="text-sm text-red-500">
                      {errors.academicPeriodId.message}
                    </p>
                  ) : null}
                  {!errors.academicPeriodId && legacyPeriodsError ? (
                    <p className="text-sm text-red-500">{legacyPeriodsError}</p>
                  ) : null}
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label
                    htmlFor="tutorial-period-title"
                    className="text-sm font-medium text-slate-700"
                  >
                    Tiêu đề
                  </Label>
                  <Input
                    id="tutorial-period-title"
                    placeholder="Ví dụ: Đợt phụ đạo học kỳ 1"
                    disabled={isSubmitting || !canEditField('title')}
                    className="h-11 rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none placeholder:text-slate-400"
                    {...register('title')}
                  />
                  {errors.title ? (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label
                    htmlFor="tutorial-period-description"
                    className="text-sm font-medium text-slate-700"
                  >
                    Mô tả
                  </Label>
                  <Textarea
                    id="tutorial-period-description"
                    placeholder="Tóm tắt ngắn gọn cho đợt phụ đạo"
                    disabled={isSubmitting || !canEditField('description')}
                    className="min-h-28 rounded-xl border-slate-200 bg-white px-3 py-2.5 leading-6 shadow-none placeholder:text-slate-400"
                    {...register('description')}
                  />
                  {errors.description ? (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="tutorial-period-start-reg-date"
                    className="text-sm font-medium text-slate-700"
                  >
                    Bắt đầu đăng ký
                  </Label>
                  <Controller
                    control={control}
                    name="registrationStartAt"
                    render={({ field }) => (
                      <DatePickerField
                        id="tutorial-period-start-reg-date"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn ngày"
                        error={errors.registrationStartAt?.message}
                        disabled={isSubmitting || !canEditField('registrationStartAt')}
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
                    name="registrationEndAt"
                    render={({ field }) => (
                      <DatePickerField
                        id="tutorial-period-end-reg-date"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn ngày"
                        error={errors.registrationEndAt?.message}
                        disabled={isSubmitting || !canEditField('registrationEndAt')}
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
                    name="studyStartAt"
                    render={({ field }) => (
                      <DatePickerField
                        id="tutorial-period-start-study-date"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn ngày"
                        error={errors.studyStartAt?.message}
                        disabled={isSubmitting || !canEditField('studyStartAt')}
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
                    name="studyEndAt"
                    render={({ field }) => (
                      <DatePickerField
                        id="tutorial-period-end-study-date"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn ngày"
                        error={errors.studyEndAt?.message}
                        disabled={isSubmitting || !canEditField('studyEndAt')}
                      />
                    )}
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label
                    htmlFor="tutorial-period-status"
                    className="text-sm font-medium text-slate-700"
                  >
                    Trạng thái
                  </Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting || !canEditField('status')}
                      >
                        <SelectTrigger
                          id="tutorial-period-status"
                          className="h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-slate-900 shadow-none"
                        >
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {tutorialPeriodStatusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status ? (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500">
                    Thời gian bộ môn phân công được tính từ sau ngày kết thúc đăng ký đến trước ngày bắt đầu học.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 mt-auto shrink-0 justify-end rounded-none border-t border-slate-200 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="min-w-[120px] rounded-xl border-slate-200 bg-white px-4 shadow-none"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] rounded-xl bg-[#0f4c81] px-5 text-white shadow-none hover:bg-[#0c3d68]"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Đang lưu...
                </>
              ) : mode === 'create' ? (
                'Tạo'
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
