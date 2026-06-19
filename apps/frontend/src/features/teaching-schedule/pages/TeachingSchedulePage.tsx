import { useEffect, useState } from 'react'
import { Calendar, List, Clock, MapPin, AlertCircle, RefreshCw, Users } from 'lucide-react'

import { useTeachingSchedule } from '../hooks'
import { getApiErrorMessage } from '@/shared/api/errors'
import ErrorState from '@/shared/ui/error-state'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import type { TeachingScheduleItem } from '../types/teachingSchedule.types'

const DAYS = [
  { value: 2, label: 'Thứ hai' },
  { value: 3, label: 'Thứ ba' },
  { value: 4, label: 'Thứ tư' },
  { value: 5, label: 'Thứ năm' },
  { value: 6, label: 'Thứ sáu' },
  { value: 7, label: 'Thứ bảy' },
  { value: 8, label: 'Chủ nhật' },
]

const periodStatusLabels: Record<string, string> = {
  OPEN: 'Mở đăng ký',
  ASSIGNING: 'Đang xếp lịch',
  ONGOING: 'Đang diễn ra',
  CLOSED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
  DRAFT: 'Nháp',
}

const periodStatusBadgeStyles: Record<string, string> = {
  OPEN: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  ASSIGNING: 'border-amber-200 bg-amber-50 text-amber-700',
  ONGOING: 'border-sky-200 bg-sky-50 text-sky-700',
  CLOSED: 'border-slate-200 bg-slate-50 text-slate-700',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700',
  DRAFT: 'border-indigo-200 bg-indigo-50 text-indigo-700',
}

export default function TeachingSchedulePage() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar')

  const scheduleQuery = useTeachingSchedule(selectedPeriodId)
  const scheduleData = scheduleQuery.data?.data
  const periods = scheduleData?.periods ?? []
  const schedules = scheduleData?.schedules ?? []

  // Auto-select first period if none selected
  useEffect(() => {
    if (periods.length > 0 && selectedPeriodId === null) {
      setSelectedPeriodId(periods[0].id)
    }
  }, [periods, selectedPeriodId])

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId)

  // Flatten schedules to individual slots for calendar rendering
  const scheduledItems = schedules.flatMap((item) => {
    if (item.schedules && item.schedules.length > 0) {
      return item.schedules.map((s) => ({
        ...item,
        dayOfWeek: s.dayOfWeek,
        startPeriod: s.startPeriod,
        room: s.room,
      }))
    }
    if (item.dayOfWeek !== null && item.startPeriod !== null) {
      return [item]
    }
    return []
  })

  const formatScheduleDetail = (item: TeachingScheduleItem) => {
    if (item.schedules && item.schedules.length > 0) {
      return item.schedules
        .map((s) => {
          const dayStr = s.dayOfWeek === 8 ? 'Chủ nhật' : `Thứ ${s.dayOfWeek}`
          const endPeriod = item.periodsPerSession
            ? s.startPeriod + item.periodsPerSession - 1
            : s.startPeriod
          const periodStr =
            item.periodsPerSession && item.periodsPerSession > 1
              ? `Tiết ${s.startPeriod}-${endPeriod}`
              : `Tiết ${s.startPeriod}`
          return `${dayStr}, ${periodStr} (${s.room})`
        })
        .join(' | ')
    }

    if (!item.dayOfWeek || !item.startPeriod || !item.room) {
      return 'Chưa xếp lịch'
    }
    const dayStr = item.dayOfWeek === 8 ? 'Chủ nhật' : `Thứ ${item.dayOfWeek}`
    const endPeriod = item.periodsPerSession
      ? item.startPeriod + item.periodsPerSession - 1
      : item.startPeriod
    const periodStr =
      item.periodsPerSession && item.periodsPerSession > 1
        ? `Tiết ${item.startPeriod}-${endPeriod}`
        : `Tiết ${item.startPeriod}`
    return `${dayStr}, ${periodStr} (${item.room})`
  }

  const isLoading = scheduleQuery.isPending && !scheduleQuery.data

  return (
    <section className="space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-full bg-violet-50/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-32 w-32 rounded-full bg-pink-50/50 blur-3xl" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Calendar className="text-violet-600 size-6" /> Lịch dạy của tôi
            </h1>
            <p className="text-sm text-slate-500">
              Xem lịch giảng dạy phụ đạo và danh sách lớp học được phân công.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {periods.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Đợt học:</span>
                <Select
                  value={selectedPeriodId?.toString() ?? ''}
                  onValueChange={(val) => setSelectedPeriodId(val ? Number(val) : null)}
                >
                  <SelectTrigger className="w-[220px] bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 transition-colors">
                    <SelectValue placeholder="Chọn đợt học" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id.toString()}>
                        {period.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedPeriod && (
              <Badge
                variant="outline"
                className={`font-semibold py-1 px-2.5 ${
                  periodStatusBadgeStyles[selectedPeriod.status] ?? 'bg-slate-100 text-slate-700'
                }`}
              >
                {periodStatusLabels[selectedPeriod.status] ?? selectedPeriod.status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-[350px] w-full rounded-2xl" />
        </div>
      ) : scheduleQuery.isError ? (
        <ErrorState
          title="Không thể tải lịch dạy"
          description={getApiErrorMessage(scheduleQuery.error, 'Vui lòng thử lại sau.')}
        />
      ) : periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
          <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-400">
            <Calendar className="size-10" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Không tìm thấy đợt học nào</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Hiện chưa có đợt phụ đạo nào hoạt động hoặc phân công lịch dạy cho bạn.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-px">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'calendar'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="size-4" /> Lịch tuần
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'list'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="size-4" /> Danh sách lớp
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                void scheduleQuery.refetch()
              }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors"
            >
              <RefreshCw className={`size-3 ${scheduleQuery.isFetching ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {activeTab === 'calendar' ? (
            <div className="space-y-6">
              {/* Responsive Grid for Days */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
                {DAYS.map((day) => {
                  const daySchedules = scheduledItems.filter((item) => item.dayOfWeek === day.value)

                  return (
                    <div
                      key={day.value}
                      className="flex flex-col rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xs shadow-xs"
                    >
                      {/* Day Header */}
                      <div className="border-b border-slate-100 bg-slate-50/50 py-2.5 px-3 text-center">
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          {day.label}
                        </span>
                      </div>

                      {/* Day Content */}
                      <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                        {daySchedules.length === 0 ? (
                          <div className="flex h-full min-h-[80px] items-center justify-center">
                            <span className="text-[11px] text-slate-400 italic">Trống lịch</span>
                          </div>
                        ) : (
                          daySchedules.map((item, idx) => {
                            const endPeriod = item.periodsPerSession
                              ? (item.startPeriod ?? 1) + item.periodsPerSession - 1
                              : item.startPeriod

                            const isCancelled = item.classStatus === 'CANCELLED'

                            return (
                              <div
                                key={idx}
                                className={`group relative rounded-lg border p-2.5 transition-all text-left hover:shadow-xs ${
                                  isCancelled
                                    ? 'bg-rose-50/60 border-rose-100 text-rose-800 line-through decoration-rose-300'
                                    : 'bg-violet-50/30 border-violet-100/70 text-slate-700 hover:border-violet-200 hover:bg-violet-50/50'
                                }`}
                              >
                                <div className="space-y-1 text-xs">
                                  <div className="font-bold text-slate-800 group-hover:text-violet-900 transition-colors line-clamp-2">
                                    {item.courseName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                    {item.courseCode} · {item.credits} TC
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-1.5 text-slate-500 font-medium">
                                    <Clock className="size-3 text-violet-500/70" />
                                    <span>
                                      Tiết {item.startPeriod} - {endPeriod}
                                    </span>
                                  </div>

                                  {item.room && (
                                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                      <MapPin className="size-3 text-emerald-500/70" />
                                      <span>Phòng {item.room}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                    <Users className="size-3 text-sky-500/70" />
                                    <span>{item.studentCount} Sinh viên</span>
                                  </div>

                                  {isCancelled && (
                                    <div className="mt-1 text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                                      <AlertCircle className="size-3 shrink-0" />
                                      <span>Đã hủy lớp</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[10%] px-4">Mã lớp</TableHead>
                    <TableHead className="w-[12%]">Mã môn</TableHead>
                    <TableHead className="w-[28%]">Tên môn học</TableHead>
                    <TableHead className="w-[8%] text-center">Số TC</TableHead>
                    <TableHead className="w-[22%]">Lịch dạy & Phòng học</TableHead>
                    <TableHead className="w-[12%] text-center">Sinh viên</TableHead>
                    <TableHead className="w-[8%] px-4">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        Bạn chưa có lớp dạy được phân công trong đợt này.
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((item, idx) => {
                      const isUnscheduled = !item.dayOfWeek || !item.startPeriod
                      const isCancelled = item.classStatus === 'CANCELLED'

                      return (
                        <TableRow key={idx}>
                          <TableCell className="px-4 py-3 font-semibold text-slate-700">
                            #{item.classId}
                          </TableCell>
                          <TableCell className="py-3 font-semibold text-slate-900 uppercase">
                            {item.courseCode}
                          </TableCell>
                          <TableCell className="py-3 text-slate-800 font-medium">
                            {item.courseName}
                          </TableCell>
                          <TableCell className="py-3 text-center text-slate-600">
                            {item.credits}
                          </TableCell>
                          <TableCell className="py-3">
                            {isUnscheduled ? (
                              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-0.5 inline-flex items-center gap-1">
                                <Clock className="size-3" /> Chưa xếp lịch dạy
                              </span>
                            ) : (
                              <div className="font-semibold text-violet-700 flex items-center gap-1.5 text-xs">
                                <Clock className="size-3.5" />
                                <span>{formatScheduleDetail(item)}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 inline-flex items-center gap-1">
                              <Users className="size-3 text-slate-500" /> {item.studentCount} SV
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {isCancelled ? (
                              <Badge className="border-rose-200 bg-rose-50 text-rose-700 font-semibold">
                                Đã hủy
                              </Badge>
                            ) : isUnscheduled ? (
                              <Badge className="border-amber-200 bg-amber-50 text-amber-700 font-semibold">
                                Chờ xếp lịch
                              </Badge>
                            ) : (
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold">
                                Hoạt động
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
