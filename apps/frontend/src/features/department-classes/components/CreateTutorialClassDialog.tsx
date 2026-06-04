import { useEffect, useMemo, useState } from 'react'

import type { DepartmentCourseRegistrationSummary } from '@/features/department-registration/types/departmentTutorialRegistration.types'
import type {
  CreateDepartmentTutorialClassPayload,
  DepartmentTutorialClass,
} from '@/features/department-classes/types/departmentTutorialClass.types'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

type CreateTutorialClassDialogProps = {
  open: boolean
  courseOptions: DepartmentCourseRegistrationSummary[]
  existingClasses: DepartmentTutorialClass[]
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateDepartmentTutorialClassPayload) => Promise<void> | void
}

export function CreateTutorialClassDialog({
  open,
  courseOptions,
  existingClasses,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: CreateTutorialClassDialogProps) {
  const [courseCode, setCourseCode] = useState('')
  const [totalSessions, setTotalSessions] = useState('5')
  const [periodsPerSession, setPeriodsPerSession] = useState('3')

  const availableCourseOptions = useMemo(() => {
    const existingCourseCodes = new Set(existingClasses.map((item) => item.courseCode))

    return courseOptions.filter((course) => !existingCourseCodes.has(course.courseCode))
  }, [courseOptions, existingClasses])

  useEffect(() => {
    if (!open) {
      return
    }

    if (
      courseCode === '' ||
      !availableCourseOptions.some((course) => course.courseCode === courseCode)
    ) {
      setCourseCode(availableCourseOptions[0]?.courseCode ?? '')
    }
  }, [availableCourseOptions, courseCode, open])

  useEffect(() => {
    if (!open) {
      setCourseCode('')
      setTotalSessions('5')
      setPeriodsPerSession('3')
    }
  }, [open])

  const totalPeriods =
    Math.max(Number.parseInt(totalSessions || '0', 10) || 0, 0) *
    Math.max(Number.parseInt(periodsPerSession || '0', 10) || 0, 0)

  const handleSubmit = async () => {
    await onSubmit({
      courseCode,
      totalSessions: Number.parseInt(totalSessions, 10) || 0,
      periodsPerSession: Number.parseInt(periodsPerSession, 10) || 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSubmitting && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Tạo lớp</DialogTitle>
          <DialogDescription>
            Tạo lớp phụ đạo từ môn học đã có sinh viên đăng ký.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Môn học</label>
            <Select
              value={courseCode}
              onValueChange={setCourseCode}
              disabled={availableCourseOptions.length === 0 || isSubmitting}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {availableCourseOptions.map((course) => (
                  <SelectItem key={course.courseCode} value={course.courseCode}>
                    {course.courseCode} · {course.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Số buổi</label>
              <Input
                type="number"
                min={1}
                max={30}
                value={totalSessions}
                onChange={(event) => setTotalSessions(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Số tiết mỗi buổi</label>
              <Input
                type="number"
                min={1}
                max={6}
                value={periodsPerSession}
                onChange={(event) => setPeriodsPerSession(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tổng số tiết</label>
            <div className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {totalPeriods}
            </div>
          </div>
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
              void handleSubmit()
            }}
            disabled={isSubmitting || availableCourseOptions.length === 0 || courseCode === ''}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo lớp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
