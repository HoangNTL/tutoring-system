import { format } from 'date-fns'

import { parseDateValue } from '@/shared/lib/date'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import ErrorState from '@/shared/ui/error-state'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import type {
  DepartmentCourseRegistrationSummary,
  DepartmentRegisteredStudent,
} from '@/features/department-registration/types/departmentTutorialRegistration.types'

type RegisteredStudentsDialogProps = {
  open: boolean
  course: DepartmentCourseRegistrationSummary | null
  students: DepartmentRegisteredStudent[]
  isLoading: boolean
  errorMessage: string | null
  onOpenChange: (open: boolean) => void
}

const formatRegisteredAt = (value: string | null) => {
  const parsed = parseDateValue(value)

  if (!parsed) {
    return '—'
  }

  return format(parsed, 'dd/MM/yy HH:mm')
}

export function RegisteredStudentsDialog({
  open,
  course,
  students,
  isLoading,
  errorMessage,
  onOpenChange,
}: RegisteredStudentsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            Sinh viên đăng ký{course ? ` - ${course.courseName}` : ''}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : errorMessage ? (
          <ErrorState title="Không thể tải sinh viên đăng ký" description={errorMessage} />
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có sinh viên đăng ký.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[24%] px-4">MSSV</TableHead>
                  <TableHead className="w-[40%] px-4">Họ tên</TableHead>
                  <TableHead className="w-[36%] px-4">Thời gian đăng ký</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="px-4 py-3 font-medium text-slate-900">
                      {student.studentCode}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-700">
                      {student.fullName || '—'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-600">
                      {formatRegisteredAt(student.registeredAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
