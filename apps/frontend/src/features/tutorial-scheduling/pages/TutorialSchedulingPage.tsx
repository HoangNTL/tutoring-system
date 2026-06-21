import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

// Predefined room lists based on the school layout:
// - H1: 5 floors, 10 rooms per floor (e.g. 101 to 110, 201 to 210, etc.)
// - H2: 4 floors, rooms start from floor 2 (2 to 4), single digit room suffix (e.g. 21 to 29, 31 to 39)
// - H3: 7 floors, rooms start from floor 2 (2 to 7), single digit room suffix (e.g. 21 to 29, 31 to 39)
const H1_ROOMS: string[] = []
for (let floor = 1; floor <= 5; floor++) {
  for (let r = 1; r <= 10; r++) {
    H1_ROOMS.push(`H1-${floor}${String(r).padStart(2, '0')}`)
  }
}

const H2_ROOMS: string[] = []
for (let floor = 2; floor <= 4; floor++) {
  for (let r = 1; r <= 9; r++) {
    H2_ROOMS.push(`H2-${floor}${r}`)
  }
}

const H3_ROOMS: string[] = []
for (let floor = 2; floor <= 7; floor++) {
  for (let r = 1; r <= 9; r++) {
    H3_ROOMS.push(`H3-${floor}${r}`)
  }
}

const ALL_BUILTIN_ROOMS = [...H1_ROOMS, ...H2_ROOMS, ...H3_ROOMS]
import {
  useDepartmentTutorialClasses,
  useUpdateClassScheduleMutation,
  useStudentSchedulesForClass,
} from '@/features/department-classes/hooks'
import { useDepartmentTutorialPeriods } from '@/features/department-registration/hooks'
import { getApiErrorMessage } from '@/shared/api/errors'
import type { StudentBusySlot } from '@/features/department-classes/types/departmentTutorialClass.types'

const DAYS = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
  { value: 8, label: 'CN' },
]

const PERIODS = [
  { startPeriod: 1, label: 'Tiết 1-3', shift: 'Sáng' },
  { startPeriod: 4, label: 'Tiết 4-6', shift: 'Sáng' },
  { startPeriod: 7, label: 'Tiết 7-9', shift: 'Chiều' },
  { startPeriod: 10, label: 'Tiết 10-12', shift: 'Tối' },
]

function StudentBusyScheduleGrid({
  totalStudents,
  busySlots,
  selectedSlots,
}: {
  totalStudents: number
  busySlots: StudentBusySlot[]
  selectedSlots: { dayOfWeek: number; startPeriod: number }[]
}) {
  // Build a lookup map for busy slots
  const busyMap = useMemo(() => {
    const map: Record<string, StudentBusySlot> = {}
    for (const slot of busySlots) {
      map[`${slot.dayOfWeek}-${slot.startPeriod}`] = slot
    }
    return map
  }, [busySlots])

  // Build a set for selected slots
  const selectedSet = useMemo(() => {
    const set = new Set<string>()
    for (const slot of selectedSlots) {
      set.add(`${slot.dayOfWeek}-${slot.startPeriod}`)
    }
    return set
  }, [selectedSlots])

  if (totalStudents === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center text-sm text-slate-500">
        <Info className="mx-auto mb-1.5 size-5 text-slate-400" />
        Chưa có sinh viên đăng ký môn học này.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <Calendar className="size-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          Lịch bận của sinh viên
        </h3>
        <span className="ml-auto rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {totalStudents} SV đăng ký
        </span>
      </div>

      <div className="overflow-x-auto p-3">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-[72px] border border-slate-200 bg-slate-50 px-2 py-2 text-left font-medium text-slate-600">
                Ca học
              </th>
              {DAYS.map((day) => (
                <th
                  key={day.value}
                  className="border border-slate-200 bg-slate-50 px-2 py-2 text-center font-medium text-slate-600"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period.startPeriod}>
                <td className="border border-slate-200 bg-slate-50 px-2 py-2 font-medium text-slate-600">
                  {period.label}
                </td>
                {DAYS.map((day) => {
                  const key = `${day.value}-${period.startPeriod}`
                  const busy = busyMap[key]
                  const isSelected = selectedSet.has(key)
                  const conflictCount = busy?.conflictCount ?? 0
                  const allBusy = conflictCount >= totalStudents

                  let bgClass = 'bg-emerald-50'
                  let textClass = 'text-emerald-600'
                  let borderExtra = ''
                  let content: React.ReactNode = (
                    <span className="flex items-center justify-center gap-0.5">
                      <CheckCircle2 className="size-3" />
                    </span>
                  )

                  if (conflictCount > 0) {
                    if (allBusy) {
                      bgClass = 'bg-rose-50'
                      textClass = 'text-rose-600'
                    } else {
                      bgClass = 'bg-amber-50'
                      textClass = 'text-amber-600'
                    }
                    content = (
                      <span className="flex items-center justify-center gap-0.5 font-semibold">
                        <AlertTriangle className="size-3" />
                        {conflictCount}/{totalStudents}
                      </span>
                    )
                  }

                  if (isSelected) {
                    borderExtra = 'ring-2 ring-indigo-500 ring-inset'
                  }

                  if (conflictCount > 0 && busy) {
                    return (
                      <td
                        key={day.value}
                        className={`border border-slate-200 px-1 py-2 text-center transition-colors cursor-pointer ${bgClass} ${textClass} ${borderExtra} relative group`}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button" className="w-full">
                              {content}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="top"
                            className="w-auto max-w-[240px] p-3 text-xs"
                          >
                            <p className="mb-1.5 font-semibold text-slate-800">
                              {conflictCount} SV bị trùng lịch:
                            </p>
                            <ul className="list-disc pl-3.5 space-y-0.5 text-slate-600">
                              {busy.students.map((name, i) => (
                                <li key={i}>{name}</li>
                              ))}
                            </ul>
                          </PopoverContent>
                        </Popover>
                      </td>
                    )
                  }

                  return (
                    <td
                      key={day.value}
                      className={`border border-slate-200 px-1 py-2 text-center transition-colors ${bgClass} ${textClass} ${borderExtra}`}
                    >
                      {content}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
          Tất cả rảnh
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm bg-amber-100 border border-amber-300" />
          Một phần SV bận
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm bg-rose-100 border border-rose-300" />
          Tất cả SV bận
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm border-2 border-indigo-500 bg-white" />
          Thời gian đang chọn
        </span>
      </div>
    </div>
  )
}

export default function TutorialSchedulingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const classId = searchParams.get('classId')

  // State for multiple schedule slots
  const [slots, setSlots] = useState<{ dayOfWeek: string; startPeriod: string; room: string }[]>([])

  // 1. Get periods
  const { data: periodsData, isLoading: periodsLoading } = useDepartmentTutorialPeriods()
  const periods = periodsData?.data ?? []

  // Find the active assigning period
  const activePeriod = periods.find(p => p.status === 'ASSIGNING') || periods[0] || null
  const periodId = activePeriod?.id ?? null

  // 2. Get classes for active period
  const { data: classesData, isLoading: classesLoading } = useDepartmentTutorialClasses(periodId)
  const classes = classesData?.data ?? []

  // 3. Find target class
  const targetClass = classes.find((c) => c.id === Number(classId))

  // 4. Get student busy schedules for this class
  const studentSchedulesQuery = useStudentSchedulesForClass(classId ? Number(classId) : null)
  const studentSchedules = studentSchedulesQuery.data?.data ?? null

  // 5. Populate form values
  useEffect(() => {
    if (targetClass) {
      if (targetClass.schedules && targetClass.schedules.length > 0) {
        setSlots(
          targetClass.schedules.map((s) => ({
            dayOfWeek: String(s.dayOfWeek),
            startPeriod: String(s.startPeriod),
            room: s.room,
          }))
        )
      } else {
        // Fallback to single slot
        setSlots([
          {
            dayOfWeek: targetClass.dayOfWeek ? String(targetClass.dayOfWeek) : '2',
            startPeriod: targetClass.startPeriod ? String(targetClass.startPeriod) : '1',
            room: targetClass.room ?? '',
          },
        ])
      }
    }
  }, [targetClass])

  // 6. Submit mutation
  const updateScheduleMutation = useUpdateClassScheduleMutation()

  // Compute selected slots for grid highlighting
  const selectedSlots = useMemo(() => {
    return slots
      .filter(s => s.dayOfWeek && s.startPeriod)
      .map(s => ({
        dayOfWeek: Number.parseInt(s.dayOfWeek, 10),
        startPeriod: Number.parseInt(s.startPeriod, 10),
      }))
  }, [slots])

  // Check if a slot has conflicts
  const getSlotConflict = (dayOfWeek: string, startPeriod: string) => {
    if (!studentSchedules) return null
    const day = Number.parseInt(dayOfWeek, 10)
    const period = Number.parseInt(startPeriod, 10)
    return studentSchedules.busySlots.find(
      s => s.dayOfWeek === day && s.startPeriod === period
    ) ?? null
  }

  const handleAddSlot = () => {
    setSlots([...slots, { dayOfWeek: '2', startPeriod: '1', room: '' }])
  }

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const handleUpdateSlot = (index: number, field: 'dayOfWeek' | 'startPeriod' | 'room', value: string) => {
    setSlots(
      slots.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const handleSave = async () => {
    if (!classId || !periodId) return

    if (slots.length === 0) {
      toast.error('Vui lòng thêm ít nhất một buổi học')
      return
    }

    const formattedSchedules = []

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      const day = Number.parseInt(slot.dayOfWeek, 10)
      const periodNum = Number.parseInt(slot.startPeriod, 10)

      if (Number.isNaN(day) || day < 2 || day > 8) {
        toast.error(`Thứ trong tuần ở buổi học thứ ${i + 1} không hợp lệ`)
        return
      }
      if (Number.isNaN(periodNum) || periodNum < 1 || periodNum > 12) {
        toast.error(`Tiết học bắt đầu ở buổi học thứ ${i + 1} không hợp lệ`)
        return
      }
      if (!slot.room.trim()) {
        toast.error(`Vui lòng chọn phòng học cho buổi học thứ ${i + 1}`)
        return
      }

      formattedSchedules.push({
        dayOfWeek: day,
        startPeriod: periodNum,
        room: slot.room.trim(),
      })
    }

    // Check for self conflicts
    const keys = formattedSchedules.map(s => `${s.dayOfWeek}-${s.startPeriod}`)
    const uniqueKeys = new Set(keys)
    if (uniqueKeys.size !== keys.length) {
      toast.error('Không thể xếp trùng thời gian cho các buổi học khác nhau của lớp')
      return
    }

    try {
      await updateScheduleMutation.mutateAsync({
        classId: Number(classId),
        tutorialPeriodId: periodId,
        payload: {
          schedules: formattedSchedules,
        },
      })
      toast.success('Xếp lịch học thành công!')
      navigate('/department-tutorial-classes')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const isLoading = periodsLoading || classesLoading

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-slate-500">Đang tải thông tin lớp học...</div>
      </div>
    )
  }

  if (!classId || !targetClass) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Không tìm thấy lớp học phần hoặc mã lớp không hợp lệ.
        </div>
        <Button onClick={() => navigate('/department-tutorial-classes')} className="mt-4" variant="outline">
          <ArrowLeft className="mr-2 size-4" /> Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Button
          onClick={() => navigate('/department-tutorial-classes')}
          variant="ghost"
          className="text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="mr-2 size-4" /> Quay lại quản lý lớp
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Calendar className="text-indigo-600 size-6" /> Xếp lịch học phụ đạo
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Vui lòng thiết lập ngày học, tiết bắt đầu và phòng học cho lớp học phần dưới đây. Có thể xếp nhiều buổi trong tuần.
        </p>

        {/* Thẻ thông tin lớp học phần */}
        <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <span className="text-slate-400 font-medium block">Môn học:</span>
              <span className="font-semibold">{targetClass.courseCode} - {targetClass.courseName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Số buổi đăng ký:</span>
              <span className="font-semibold">{targetClass.totalSessions} buổi (tiết / buổi: {targetClass.periodsPerSession} tiết)</span>
            </div>
          </div>
        </div>

        {/* Student busy schedule grid */}
        <div className="mb-6">
          {studentSchedulesQuery.isPending ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <div className="text-sm text-slate-500">Đang tải lịch bận của sinh viên...</div>
            </div>
          ) : studentSchedulesQuery.isError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <AlertTriangle className="mb-1 inline size-4" />{' '}
              Không thể tải lịch bận. Vui lòng xếp lịch thủ công.
            </div>
          ) : studentSchedules ? (
            <StudentBusyScheduleGrid
              totalStudents={studentSchedules.totalStudents}
              busySlots={studentSchedules.busySlots}
              selectedSlots={selectedSlots}
            />
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {slots.map((slot, index) => {
              const isCustomRoom = slot.room && !ALL_BUILTIN_ROOMS.includes(slot.room)
              const conflict = getSlotConflict(slot.dayOfWeek, slot.startPeriod)

              return (
                <div key={index} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-sm">Buổi học thứ {index + 1}</h3>
                    {slots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveSlot(index)}
                        className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 -mr-2 h-8 px-2 text-xs"
                      >
                        Xóa buổi
                      </Button>
                    )}
                  </div>

                  {/* Conflict warning inline */}
                  {conflict && (
                    <div className={`rounded-lg px-3 py-2 text-xs flex items-start gap-2 ${
                      conflict.conflictCount >= (studentSchedules?.totalStudents ?? 0)
                        ? 'bg-rose-50 border border-rose-200 text-rose-700'
                        : 'bg-amber-50 border border-amber-200 text-amber-700'
                    }`}>
                      <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold">{conflict.conflictCount}/{studentSchedules?.totalStudents ?? '?'} SV</span> bị trùng lịch:{' '}
                        {conflict.students.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Thứ trong tuần */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Thứ trong tuần</label>
                      <Select
                        value={slot.dayOfWeek}
                        onValueChange={(val) => handleUpdateSlot(index, 'dayOfWeek', val)}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Chọn thứ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">Thứ hai</SelectItem>
                          <SelectItem value="3">Thứ ba</SelectItem>
                          <SelectItem value="4">Thứ tư</SelectItem>
                          <SelectItem value="5">Thứ năm</SelectItem>
                          <SelectItem value="6">Thứ sáu</SelectItem>
                          <SelectItem value="7">Thứ bảy</SelectItem>
                          <SelectItem value="8">Chủ nhật</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tiết học bắt đầu */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Tiết học bắt đầu</label>
                      <Select
                        value={slot.startPeriod}
                        onValueChange={(val) => handleUpdateSlot(index, 'startPeriod', val)}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Chọn tiết" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Tiết 1 - 3</SelectItem>
                          <SelectItem value="4">Tiết 4 - 6</SelectItem>
                          <SelectItem value="7">Tiết 7 - 9</SelectItem>
                          <SelectItem value="10">Tiết 10 - 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Phòng học */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Phòng học</label>
                    <Select
                      value={slot.room}
                      onValueChange={(val) => handleUpdateSlot(index, 'room', val)}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Chọn phòng học" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {isCustomRoom && (
                          <SelectGroup>
                            <SelectLabel>Phòng hiện tại</SelectLabel>
                            <SelectItem value={slot.room}>{slot.room}</SelectItem>
                          </SelectGroup>
                        )}
                        <SelectGroup>
                          <SelectLabel>Tòa H1</SelectLabel>
                          {H1_ROOMS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Tòa H2</SelectLabel>
                          {H2_ROOMS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Tòa H3</SelectLabel>
                          {H3_ROOMS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddSlot}
            className="w-full border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-1 py-3"
          >
            + Thêm buổi học trong tuần
          </Button>

          {/* Nút lưu */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/department-tutorial-classes')}
              disabled={updateScheduleMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={updateScheduleMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {updateScheduleMutation.isPending ? 'Đang lưu...' : 'Lưu lịch học'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
