import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Calendar } from 'lucide-react'

import { Button } from '@/shared/ui/button'
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
} from '@/features/department-classes/hooks'
import { useDepartmentTutorialPeriods } from '@/features/department-registration/hooks'
import { getApiErrorMessage } from '@/shared/api/errors'

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

  // 4. Populate form values
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

  // 5. Submit mutation
  const updateScheduleMutation = useUpdateClassScheduleMutation()

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
    <div className="mx-auto max-w-2xl p-6">
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

        <div className="space-y-6">
          <div className="space-y-4">
            {slots.map((slot, index) => {
              const isCustomRoom = slot.room && !ALL_BUILTIN_ROOMS.includes(slot.room)
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
