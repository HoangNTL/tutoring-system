import { Button } from '@/shared/ui/button'
import type { StudentTutorialCourse } from '@/features/tutorial-registration/types/studentTutorialRegistrationInfo.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

type RegisteredCoursesTableProps = {
  courses: StudentTutorialCourse[]
  cancellingCourseCode?: string | null
  onCancel: (courseCode: string) => void
}

export function RegisteredCoursesTable({
  courses,
  cancellingCourseCode = null,
  onCancel,
}: RegisteredCoursesTableProps) {
  if (courses.length === 0) {
    return <p className="text-sm text-slate-500">Chưa đăng ký môn học nào.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[24%] px-4">Mã môn</TableHead>
            <TableHead className="w-[46%]">Tên môn</TableHead>
            <TableHead className="w-[14%] px-4 text-right">Số tín chỉ</TableHead>
            <TableHead className="w-[16%] px-4 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.courseCode}>
              <TableCell className="px-4 py-3 font-medium text-slate-900">
                {course.courseCode}
              </TableCell>
              <TableCell className="py-3 text-slate-700">{course.courseName}</TableCell>
              <TableCell className="px-4 py-3 text-right text-slate-700">
                {course.credits}
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={cancellingCourseCode === course.courseCode}
                  onClick={() => onCancel(course.courseCode)}
                >
                  {cancellingCourseCode === course.courseCode ? 'Đang hủy...' : 'Hủy'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
