import type {
  AssignDepartmentTutorialClassLecturerPayload,
  DepartmentTutorialClass,
} from '@/features/department-classes/types/departmentTutorialClass.types'
import { useDepartmentLecturers } from '@/features/department-classes/hooks'
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
import { toast } from 'sonner'
import { useEffect, useMemo, useState } from 'react'

type AssignLecturerDialogProps = {
  tutorialClass: DepartmentTutorialClass | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: AssignDepartmentTutorialClassLecturerPayload) => Promise<void> | void
}

export function AssignLecturerDialog({
  tutorialClass,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AssignLecturerDialogProps) {
  const [selectedLecturerId, setSelectedLecturerId] = useState<string>('')
  const lecturersQuery = useDepartmentLecturers()
  const lecturers = lecturersQuery.data?.data ?? []

  useEffect(() => {
    if (!tutorialClass) {
      setSelectedLecturerId('')
      return
    }

    setSelectedLecturerId(
      tutorialClass.lecturerId !== null ? String(tutorialClass.lecturerId) : ''
    )
  }, [tutorialClass])

  useEffect(() => {
    if (tutorialClass !== null && lecturersQuery.isError) {
      toast.error(
        getApiErrorMessage(lecturersQuery.error, 'Không thể tải danh sách giảng viên.')
      )
    }
  }, [tutorialClass, lecturersQuery.error, lecturersQuery.isError])

  const title = useMemo(() => {
    if (!tutorialClass) {
      return 'Phân công giảng viên'
    }

    return tutorialClass.status === 'PLANNED' ? 'Phân công giảng viên' : 'Đổi giảng viên'
  }, [tutorialClass])

  const handleSubmit = async () => {
    if (!selectedLecturerId) {
      toast.error('Vui lòng chọn giảng viên.')
      return
    }

    await onSubmit({ lecturerId: Number(selectedLecturerId) })
  }

  return (
    <Dialog
      open={tutorialClass !== null}
      onOpenChange={(nextOpen) => !isSubmitting && onOpenChange(nextOpen)}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Chọn giảng viên phụ trách cho lớp phụ đạo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Giảng viên</label>
          <Select
            value={selectedLecturerId}
            onValueChange={setSelectedLecturerId}
            disabled={isSubmitting || lecturersQuery.isPending || lecturersQuery.isError}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue
                placeholder={
                  lecturersQuery.isPending
                    ? 'Đang tải giảng viên...'
                    : lecturersQuery.isError
                      ? 'Không thể tải giảng viên'
                      : 'Chọn giảng viên'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {lecturersQuery.isPending ? (
                <SelectItem value="__loading" disabled>
                  Đang tải giảng viên...
                </SelectItem>
              ) : lecturersQuery.isError ? (
                <SelectItem value="__error" disabled>
                  Không thể tải giảng viên.
                </SelectItem>
              ) : lecturers.length === 0 ? (
                <SelectItem value="__empty" disabled>
                  Không có giảng viên.
                </SelectItem>
              ) : (
                lecturers.map((lecturer) => (
                  <SelectItem key={lecturer.id} value={String(lecturer.id)}>
                    {lecturer.fullName} · {lecturer.code}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {tutorialClass !== null && lecturersQuery.isError ? (
            <p className="text-sm text-rose-600">
              {getApiErrorMessage(
                lecturersQuery.error,
                'Không thể tải danh sách giảng viên.'
              )}
            </p>
          ) : null}
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
            disabled={
              isSubmitting ||
              selectedLecturerId === '' ||
              lecturersQuery.isPending ||
              lecturersQuery.isError
            }
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
