import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import type { DepartmentCourseRegistrationSummary } from '@/features/department-registration/types/departmentTutorialRegistration.types'

type CourseRegistrationSummaryTableProps = {
  items: DepartmentCourseRegistrationSummary[]
  onViewStudents: (course: DepartmentCourseRegistrationSummary) => void
}

export function CourseRegistrationSummaryTable({
  items,
  onViewStudents,
}: CourseRegistrationSummaryTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có môn học nào có sinh viên đăng ký.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[18%] px-4">Mã môn</TableHead>
            <TableHead className="w-[42%]">Tên môn</TableHead>
            <TableHead className="w-[14%] text-right">Số tín chỉ</TableHead>
            <TableHead className="w-[14%] text-right">Số sinh viên</TableHead>
            <TableHead className="w-[12%] px-4 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.courseCode}>
              <TableCell className="px-4 py-3 font-medium text-slate-900">
                {item.courseCode}
              </TableCell>
              <TableCell className="py-3 text-slate-700">{item.courseName}</TableCell>
              <TableCell className="py-3 text-right text-slate-700">
                {item.credits}
              </TableCell>
              <TableCell className="py-3 text-right text-slate-700">
                {item.studentCount}
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg px-3"
                  onClick={() => onViewStudents(item)}
                >
                  Xem sinh viên
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
