import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { RoomCombobox } from '@/features/department-classes/components/RoomCombobox'
import {
  useCreateDepartmentTutorialClassScheduleMutation,
  useDeleteDepartmentTutorialClassScheduleMutation,
  useDepartmentTutorialClassSchedules,
} from '@/features/department-classes/hooks'
import type {
  CreateDepartmentTutorialClassSchedulePayload,
  DepartmentRoomOption,
  DepartmentTutorialClass,
} from '@/features/department-classes/types/departmentTutorialClass.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

const dayOptions = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
  { value: 8, label: 'Chủ nhật' },
]

type ManageScheduleDialogProps = {
  tutorialClass: DepartmentTutorialClass | null
  tutorialPeriodId: number | null
  rooms: DepartmentRoomOption[]
  roomsLoading?: boolean
  onOpenChange: (open: boolean) => void
}

const formatDayLabel = (dayOfWeek: number) =>
  dayOfWeek === 8 ? 'Chủ nhật' : `Thứ ${dayOfWeek}`

const formatRoomLabel = (roomCode: string | null, roomName: string | null) =>
  roomCode ?? roomName ?? '—'

export function ManageScheduleDialog({
  tutorialClass,
  tutorialPeriodId,
  rooms,
  roomsLoading = false,
  onOpenChange,
}: ManageScheduleDialogProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [dayOfWeek, setDayOfWeek] = useState<number>(2)
  const [startPeriod, setStartPeriod] = useState<number>(1)

  const schedulesQuery = useDepartmentTutorialClassSchedules(tutorialClass?.id ?? null)
  const schedules = schedulesQuery.data?.data ?? []

  const createScheduleMutation = useCreateDepartmentTutorialClassScheduleMutation()
  const deleteScheduleMutation = useDeleteDepartmentTutorialClassScheduleMutation()

  const resetForm = () => {
    setSelectedRoomId('')
    setDayOfWeek(2)
    setStartPeriod(1)
  }

  const periodsPerSession = tutorialClass?.periodsPerSession ?? 0
  const totalSessions = tutorialClass?.totalSessions ?? 0
  const scheduleCount = schedules.length
  const endPeriod = startPeriod + periodsPerSession - 1
  const estimatedWeeks =
    scheduleCount > 0 ? Math.ceil(totalSessions / scheduleCount) : null
  const hasPartialFinalWeek =
    scheduleCount > 0 && totalSessions > 0 && totalSessions % scheduleCount !== 0
  const startPeriodOptions = useMemo(
    () =>
      Array.from(
        { length: Math.max(16 - periodsPerSession, 0) },
        (_, index) => index + 1
      ),
    [periodsPerSession]
  )

  const isSubmitting =
    createScheduleMutation.isPending || deleteScheduleMutation.isPending

  useEffect(() => {
    if (tutorialClass !== null && schedulesQuery.isError) {
      toast.error(
        getApiErrorMessage(schedulesQuery.error, 'Không thể tải danh sách lịch học.')
      )
    }
  }, [tutorialClass, schedulesQuery.error, schedulesQuery.isError])

  const handleCreateSchedule = async () => {
    if (!tutorialClass || !tutorialPeriodId) {
      return
    }

    if (!selectedRoomId) {
      toast.error('Vui lòng chọn phòng học.')
      return
    }

    const payload: CreateDepartmentTutorialClassSchedulePayload = {
      roomId: Number(selectedRoomId),
      dayOfWeek,
      startPeriod,
    }

    try {
      await createScheduleMutation.mutateAsync({
        classId: tutorialClass.id,
        tutorialPeriodId,
        payload,
      })
      resetForm()
      toast.success('Thêm khung giờ hằng tuần thành công.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể thêm khung giờ hằng tuần.'))
    }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!tutorialClass || !tutorialPeriodId) {
      return
    }

    try {
      await deleteScheduleMutation.mutateAsync({
        classId: tutorialClass.id,
        tutorialPeriodId,
        scheduleId,
      })
      toast.success('Xóa khung giờ hằng tuần thành công.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể xóa khung giờ hằng tuần.'))
    }
  }

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog
      open={tutorialClass !== null}
      onOpenChange={(nextOpen) => !isSubmitting && handleDialogOpenChange(nextOpen)}
    >
      <DialogContent className="sm:max-w-2xl" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>
            {tutorialClass
              ? `Thiết lập lịch học hằng tuần - ${tutorialClass.courseName}`
              : 'Thiết lập lịch học hằng tuần'}
          </DialogTitle>
          <DialogDescription>
            Các khung giờ dưới đây sẽ được lặp lại hằng tuần cho đến khi đủ số buổi học.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tổng quan
                </p>
                <p className="text-sm font-medium text-slate-900">
                  Tổng số buổi: {totalSessions}
                </p>
                <p className="text-sm text-slate-600">{periodsPerSession} tiết/buổi</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tiến độ thiết lập
                </p>
                {scheduleCount > 0 ? (
                  <>
                    <p className="text-sm font-medium text-slate-900">
                      Đã thiết lập: {scheduleCount} buổi/tuần
                    </p>
                    <p className="text-sm text-slate-600">
                      Dự kiến hoàn thành: {estimatedWeeks} tuần
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">Chưa thiết lập lịch học.</p>
                )}
              </div>
            </div>
            {hasPartialFinalWeek ? (
              <p className="text-xs text-slate-500">
                Tuần cuối có thể không học đủ số buổi.
              </p>
            ) : null}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Lịch học hằng tuần</h3>
              {tutorialClass ? (
                <span className="text-xs text-slate-500">
                  {tutorialClass.periodsPerSession} tiết/buổi
                </span>
              ) : null}
            </div>

            {schedulesQuery.isPending && !schedulesQuery.data ? (
              <div className="space-y-2">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            ) : schedulesQuery.isError ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {getApiErrorMessage(
                  schedulesQuery.error,
                  'Không thể tải danh sách lịch học.'
                )}
              </p>
            ) : schedules.length === 0 ? (
              <p className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
                Chưa thiết lập lịch học.
              </p>
            ) : (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-slate-900">
                        {formatDayLabel(schedule.dayOfWeek)} · Tiết {schedule.startPeriod}-
                        {schedule.endPeriod}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatRoomLabel(schedule.roomCode, schedule.roomName)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      disabled={isSubmitting}
                      onClick={() => {
                        void handleDeleteSchedule(schedule.id)
                      }}
                    >
                      <Trash2 className="size-4" />
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-900">Thêm khung giờ hằng tuần</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Phòng</label>
              <RoomCombobox
                rooms={rooms}
                value={selectedRoomId}
                disabled={isSubmitting}
                isLoading={roomsLoading}
                onValueChange={setSelectedRoomId}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Thứ</label>
                <Select
                  value={dayOfWeek.toString()}
                  onValueChange={(value) => setDayOfWeek(Number(value))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn thứ" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tiết bắt đầu</label>
                <Select
                  value={startPeriod.toString()}
                  onValueChange={(value) => setStartPeriod(Number(value))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn tiết bắt đầu" />
                  </SelectTrigger>
                  <SelectContent>
                    {startPeriodOptions.map((period) => (
                      <SelectItem key={period} value={period.toString()}>
                        Tiết {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tiết kết thúc</label>
                <div className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {endPeriod}
                </div>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={() => {
              void handleCreateSchedule()
            }}
            disabled={
              isSubmitting ||
              roomsLoading ||
              selectedRoomId === '' ||
              endPeriod > 15
            }
          >
            {createScheduleMutation.isPending ? 'Đang thêm...' : 'Thêm khung giờ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
