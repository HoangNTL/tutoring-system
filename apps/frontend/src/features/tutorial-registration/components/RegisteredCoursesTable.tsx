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
}

export function RegisteredCoursesTable({ courses }: RegisteredCoursesTableProps) {
  if (courses.length === 0) {
    return <p className="text-sm text-slate-500">Chưa đăng ký môn học nào.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[24%] px-4">Mã môn</TableHead>
            <TableHead className="w-[56%]">Tên môn</TableHead>
            <TableHead className="w-[20%] px-4 text-right">Số tín chỉ</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
