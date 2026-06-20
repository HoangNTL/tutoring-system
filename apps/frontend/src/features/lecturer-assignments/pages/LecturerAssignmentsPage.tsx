import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, UserCheck, Search, Check } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  useDepartmentTutorialClasses,
  useDepartmentLecturers,
  useUpdateClassLecturerMutation,
} from '@/features/department-classes/hooks'
import { useDepartmentTutorialPeriods } from '@/features/department-registration/hooks'
import { getApiErrorMessage } from '@/shared/api/errors'

export default function LecturerAssignmentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const classId = searchParams.get('classId')

  // Search filter
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLecturerId, setSelectedLecturerId] = useState<number | null>(null)

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

  // 4. Get department lecturers
  const { data: lecturersData, isLoading: lecturersLoading } = useDepartmentLecturers(targetClass?.courseCode)
  const lecturers = lecturersData?.data ?? []

  // 5. Populate initial selection
  useEffect(() => {
    if (targetClass?.lecturerId) {
      setSelectedLecturerId(targetClass.lecturerId)
    }
  }, [targetClass])

  // 6. Submit mutation
  const updateLecturerMutation = useUpdateClassLecturerMutation()

  const handleSave = async () => {
    if (!classId || !periodId) return
    if (!selectedLecturerId) {
      toast.error('Vui lòng chọn giảng viên')
      return
    }

    const lecturer = lecturers.find(l => l.id === selectedLecturerId)
    if (!lecturer) {
      toast.error('Giảng viên đã chọn không hợp lệ')
      return
    }

    const lecturerName = lecturer.fullName || lecturer.lecturerCode

    try {
      await updateLecturerMutation.mutateAsync({
        classId: Number(classId),
        tutorialPeriodId: periodId,
        payload: {
          lecturerId: lecturer.id,
          lecturerName: lecturerName,
        },
      })
      toast.success('Phân công giảng viên thành công!')
      navigate('/department-tutorial-classes')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  // Filtered lecturers
  const filteredLecturers = lecturers.filter((l) => {
    const text = searchTerm.toLowerCase().trim()
    if (!text) return true

    const fullName = (l.fullName ?? '').toLowerCase()
    const lecturerCode = (l.lecturerCode ?? '').toLowerCase()

    return fullName.includes(text) || lecturerCode.includes(text)
  })

  const isLoading = periodsLoading || classesLoading || lecturersLoading

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-slate-500">Đang tải thông tin...</div>
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
          <UserCheck className="text-indigo-600 size-6" /> Phân công giảng viên
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Chọn giảng viên phụ trách giảng dạy cho lớp phụ đạo dưới đây.
        </p>

        {/* Thẻ thông tin lớp học phần */}
        <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <span className="text-slate-400 font-medium block">Môn học:</span>
              <span className="font-semibold">{targetClass.courseCode} - {targetClass.courseName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Số buổi:</span>
              <span className="font-semibold">{targetClass.totalSessions} buổi ({targetClass.totalPeriods} tiết)</span>
            </div>
          </div>
        </div>

        {/* Bộ lọc tìm kiếm giảng viên */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Tìm theo tên hoặc mã giảng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Danh sách giảng viên */}
        <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 mb-6">
          {lecturers.length === 0 ? (
            <div className="text-center p-6 text-slate-500 space-y-2">
              <p className="font-semibold text-slate-700 text-sm">Không tìm thấy giảng viên đề xuất cho môn học này</p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                Môn học <strong className="text-slate-600 font-mono">{targetClass?.courseCode}</strong> hiện chưa được gán giảng viên giảng dạy trong danh mục đào tạo của trường. Vui lòng liên hệ Phòng Đào tạo để thiết lập liên kết giảng viên - môn học.
              </p>
            </div>
          ) : filteredLecturers.length === 0 ? (
            <p className="text-sm text-slate-500 p-4 text-center">Không tìm thấy giảng viên khớp với từ khóa tìm kiếm.</p>
          ) : (
            filteredLecturers.map((lecturer) => {
              const isSelected = selectedLecturerId === lecturer.id
              return (
                <div
                  key={lecturer.id}
                  onClick={() => setSelectedLecturerId(lecturer.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/55'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-medium text-slate-800 block">
                      {lecturer.fullName || 'Chưa cập nhật tên'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Mã: {lecturer.lecturerCode} {lecturer.dateOfBirth ? `· Ngày sinh: ${lecturer.dateOfBirth}` : ''}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="bg-indigo-600 text-white rounded-full p-0.5">
                      <Check className="size-4" />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/department-tutorial-classes')}
            disabled={updateLecturerMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateLecturerMutation.isPending || !selectedLecturerId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {updateLecturerMutation.isPending ? 'Đang lưu...' : 'Xác nhận phân công'}
          </Button>
        </div>
      </div>
    </div>
  )
}
