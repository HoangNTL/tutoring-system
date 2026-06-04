import { useEffect, useMemo, useState } from 'react'

import type {
  DepartmentTutorialClass,
  UpdateDepartmentTutorialClassPayload,
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

type EditTutorialClassDialogProps = {
  tutorialClass: DepartmentTutorialClass | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: UpdateDepartmentTutorialClassPayload) => Promise<void> | void
}

export function EditTutorialClassDialog({
  tutorialClass,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: EditTutorialClassDialogProps) {
  const [totalSessions, setTotalSessions] = useState('5')
  const [periodsPerSession, setPeriodsPerSession] = useState('3')

  useEffect(() => {
    if (!tutorialClass) {
      setTotalSessions('5')
      setPeriodsPerSession('3')
      return
    }

    setTotalSessions(String(tutorialClass.totalSessions))
    setPeriodsPerSession(String(tutorialClass.periodsPerSession))
  }, [tutorialClass])

  const totalPeriods = useMemo(
    () =>
      Math.max(Number.parseInt(totalSessions || '0', 10) || 0, 0) *
      Math.max(Number.parseInt(periodsPerSession || '0', 10) || 0, 0),
    [periodsPerSession, totalSessions]
  )

  const handleSubmit = async () => {
    await onSubmit({
      totalSessions: Number.parseInt(totalSessions, 10) || 0,
      periodsPerSession: Number.parseInt(periodsPerSession, 10) || 0,
    })
  }

  return (
    <Dialog
      open={tutorialClass !== null}
      onOpenChange={(nextOpen) => !isSubmitting && onOpenChange(nextOpen)}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Sửa lớp</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin kế hoạch cho lớp phụ đạo đã tạo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Môn học</label>
            <div className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {tutorialClass ? `${tutorialClass.courseCode} · ${tutorialClass.courseName}` : ''}
            </div>
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
            disabled={isSubmitting || tutorialClass === null}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
