import { useEffect, useState } from 'react'
import { Calendar, List, Clock, AlertCircle, RefreshCw, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, format, addWeeks, subWeeks } from 'date-fns'

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
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
  { value: 8, label: 'Chủ nhật' },
]

const SHIFTS = [
  { value: 'Sáng', label: 'Sáng' },
  { value: 'Chiều', label: 'Chiều' },
  { value: 'Tối', label: 'Tối' },
]

const getMonday = (date: Date): Date => {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const getShiftOfPeriod = (startPeriod: number | null): 'Sáng' | 'Chiều' | 'Tối' => {
  if (startPeriod === null) return 'Sáng'
  if (startPeriod >= 1 && startPeriod <= 6) return 'Sáng'
  if (startPeriod >= 7 && startPeriod <= 12) return 'Chiều'
  return 'Tối'
}

const getPeriodTimeRange = (start: number, end: number) => {
  const periodTimes: Record<number, { start: string; end: string }> = {
    1: { start: '07:00', end: '07:45' },
    2: { start: '07:50', end: '08:35' },
    3: { start: '08:40', end: '09:25' },
    4: { start: '09:40', end: '10:25' },
    5: { start: '10:30', end: '11:15' },
    6: { start: '11:20', end: '12:05' },
    7: { start: '12:30', end: '13:15' },
    8: { start: '13:20', end: '14:05' },
    9: { start: '14:10', end: '15:10' },
    10: { start: '15:20', end: '16:05' },
    11: { start: '16:10', end: '16:55' },
    12: { start: '17:00', end: '17:45' },
    13: { start: '18:00', end: '18:45' },
    14: { start: '18:50', end: '19:35' },
    15: { start: '19:40', end: '20:25' }
  }

  if (start === 1 && end === 3) return '07:00 - 09:30'
  if (start === 4 && end === 6) return '09:40 - 12:10'
  if (start === 7 && end === 9) return '12:30 - 15:10'
  if (start === 10 && end === 12) return '15:20 - 18:00'
  if (start === 13 && end === 15) return '18:15 - 20:45'

  const startTime = periodTimes[start]?.start || '07:00'
  const endTime = periodTimes[end]?.end || periodTimes[start]?.end || '09:30'
  return `${startTime} - ${endTime}`
}

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

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()))

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1))
  }

  const handleCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()))
  }

  const weekEnd = addDays(currentWeekStart, 6)
  const weekRangeStr = `Tuần: ${format(currentWeekStart, 'dd/MM/yyyy')} - ${format(weekEnd, 'dd/MM/yyyy')}`

  const getHeaderDate = (dayValue: number) => {
    const index = dayValue === 8 ? 6 : dayValue - 2
    const targetDate = addDays(currentWeekStart, index)
    return format(targetDate, 'dd/MM/yyyy')
  }

  const getItemsForCell = (dayValue: number, shift: 'Sáng' | 'Chiều' | 'Tối') => {
    return scheduledItems.filter(
      (item) => item.dayOfWeek === dayValue && getShiftOfPeriod(item.startPeriod) === shift
    )
  }

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
            <div className="space-y-4">
              {/* Week Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-sm font-semibold text-slate-700">{weekRangeStr}</span>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-xs cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCurrentWeek}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs cursor-pointer"
                >
                  Tuần này
                </button>
              </div>

              {/* Grid Timetable */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full min-w-[1000px] border-collapse text-left table-fixed">
                  <thead className="bg-[#f5f3ff]/70 border-b border-slate-200">
                    <tr>
                      <th className="w-[100px] py-3.5 px-3 text-center border-r border-slate-200 font-bold text-violet-700 text-xs uppercase tracking-wider">
                        Ca học
                      </th>
                      {DAYS.map((day) => (
                        <th key={day.value} className="py-3.5 px-3 text-center border-r border-slate-200 font-bold text-violet-700 text-xs last:border-r-0">
                          <div className="font-bold text-violet-800">{day.label}</div>
                          <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{getHeaderDate(day.value)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SHIFTS.map((shift) => (
                      <tr key={shift.value} className="border-b border-slate-200 last:border-b-0">
                        <td className="py-6 px-3 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50/50 text-xs">
                          {shift.label}
                        </td>
                        {DAYS.map((day) => {
                          const cellItems = getItemsForCell(day.value, shift.value as 'Sáng' | 'Chiều' | 'Tối')

                          return (
                            <td
                              key={day.value}
                              className="p-2 border-r border-slate-200 align-top min-h-[150px] last:border-r-0"
                              style={{
                                backgroundImage: 'linear-gradient(to right, #f8fafc 1px, transparent 1px), linear-gradient(to bottom, #f8fafc 1px, transparent 1px)',
                                backgroundSize: '15px 15px',
                                backgroundColor: '#ffffff'
                              }}
                            >
                              <div className="flex flex-col gap-2 min-h-[100px]">
                                {cellItems.length > 0 ? (
                                  cellItems.map((item, idx) => {
                                    const endPeriod = item.periodsPerSession
                                      ? (item.startPeriod ?? 1) + item.periodsPerSession - 1
                                      : item.startPeriod

                                    const isCancelled = item.classStatus === 'CANCELLED'

                                    return (
                                      <div
                                        key={idx}
                                        className={`group relative rounded-lg border-2 p-2.5 transition-all text-left shadow-xs hover:shadow-md hover:scale-[1.01] ${
                                          isCancelled
                                            ? 'border-rose-200 bg-rose-50/20 text-slate-400 line-through decoration-rose-300'
                                            : 'border-violet-400/80 bg-white hover:border-violet-500'
                                        }`}
                                      >
                                        <div className="space-y-1 text-[11px] leading-relaxed">
                                          <div className="font-bold text-[#002060] group-hover:text-violet-900 transition-colors line-clamp-3 text-xs leading-snug">
                                            {item.courseName}
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                            {item.courseCode} · {item.credits} TC
                                          </div>

                                          <div className="text-slate-600 font-medium mt-1">
                                            Tiết: {item.startPeriod} - {endPeriod}
                                          </div>

                                          <div className="text-slate-600 font-medium">
                                            Giờ: {getPeriodTimeRange(item.startPeriod ?? 1, endPeriod ?? 1)}
                                          </div>

                                          {item.room && (
                                            <div className="text-slate-600 font-medium">
                                              Phòng: {item.room}
                                            </div>
                                          )}

                                          <div className="text-slate-500 italic mt-0.5 border-t border-slate-100 pt-0.5 flex items-center gap-1 font-medium">
                                            <Users className="size-3 text-violet-500/70" />
                                            <span>Sĩ số: {item.studentCount} SV</span>
                                          </div>

                                          {isCancelled && (
                                            <div className="mt-1 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                                              <AlertCircle className="size-3 shrink-0" />
                                              <span>Đã hủy lớp</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <div className="flex h-full min-h-[100px] items-center justify-center">
                                    <span className="text-[10px] text-slate-400 italic">Trống lịch</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
