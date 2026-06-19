import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Calendar } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
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

  // State for form
  const [dayOfWeek, setDayOfWeek] = useState<string>('')
  const [startPeriod, setStartPeriod] = useState<string>('')
  const [room, setRoom] = useState<string>('')

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
      setDayOfWeek(targetClass.dayOfWeek ? String(targetClass.dayOfWeek) : '2')
      
      let initialPeriod = '1'
      if (targetClass.startPeriod) {
        const p = targetClass.startPeriod
        if (p <= 3) initialPeriod = '1'
        else if (p <= 6) initialPeriod = '4'
        else if (p <= 9) initialPeriod = '7'
        else initialPeriod = '10'
      }
      setStartPeriod(initialPeriod)
      
      setRoom(targetClass.room ?? '')
    }
  }, [targetClass])

  // 5. Submit mutation
  const updateScheduleMutation = useUpdateClassScheduleMutation()

  const handleSave = async () => {
    if (!classId || !periodId) return

    const day = Number.parseInt(dayOfWeek, 10)
    const periodNum = Number.parseInt(startPeriod, 10)

    if (Number.isNaN(day) || day < 2 || day > 8) {
      toast.error('Thứ trong tuần không hợp lệ')
      return
    }
    if (Number.isNaN(periodNum) || periodNum < 1 || periodNum > 12) {
      toast.error('Tiết học bắt đầu không hợp lệ')
      return
    }
    if (!room.trim()) {
      toast.error('Vui lòng nhập phòng học')
      return
    }

    try {
      await updateScheduleMutation.mutateAsync({
        classId: Number(classId),
        tutorialPeriodId: periodId,
        payload: {
          dayOfWeek: day,
          startPeriod: periodNum,
          room: room.trim(),
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
          Vui lòng thiết lập ngày học, tiết bắt đầu và phòng học cho lớp học phần dưới đây.
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

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Thứ trong tuần */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Thứ trong tuần</label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="w-full">
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
              <Select value={startPeriod} onValueChange={setStartPeriod}>
                <SelectTrigger className="w-full">
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
            <Input
              type="text"
              placeholder="Nhập tên phòng học (ví dụ: A1-202)"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              maxLength={50}
            />
          </div>

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
