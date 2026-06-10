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

type AvailableCoursesTableProps = {
  courses: StudentTutorialCourse[]
  canRegister?: boolean
  registeringCourseCode?: string | null
  onRegister: (courseCode: string) => void
}

export function AvailableCoursesTable({
  courses,
  canRegister = true,
  registeringCourseCode = null,
  onRegister,
}: AvailableCoursesTableProps) {
  if (courses.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có môn học.</p>
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
                  className="h-8 rounded-lg px-3"
                  disabled={!canRegister || registeringCourseCode === course.courseCode}
                  onClick={() => onRegister(course.courseCode)}
                >
                  {registeringCourseCode === course.courseCode ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
