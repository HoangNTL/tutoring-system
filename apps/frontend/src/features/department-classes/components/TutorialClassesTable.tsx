import { MoreHorizontal, RotateCcw, Pencil, XCircle } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import type { DepartmentTutorialClass } from '@/features/department-classes/types/departmentTutorialClass.types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'

const statusLabels: Record<DepartmentTutorialClass['status'], string> = {
  PLANNED: 'Kế hoạch',
  CANCELLED: 'Đã hủy',
}

const statusBadgeClassNames: Record<DepartmentTutorialClass['status'], string> = {
  PLANNED: 'border-sky-200 bg-sky-100 text-sky-700',
  CANCELLED: 'border-rose-200 bg-rose-100 text-rose-700',
}

export function TutorialClassesTable({
  classes,
  onEdit,
  onCancel,
  onRestore,
}: {
  classes: DepartmentTutorialClass[]
  onEdit: (tutorialClass: DepartmentTutorialClass) => void
  onCancel: (tutorialClass: DepartmentTutorialClass) => void
  onRestore: (tutorialClass: DepartmentTutorialClass) => void
}) {
  if (classes.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có lớp phụ đạo nào.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[14%] px-4">Mã môn</TableHead>
            <TableHead className="w-[32%]">Tên môn</TableHead>
            <TableHead className="w-[10%] text-right">Số SV</TableHead>
            <TableHead className="w-[10%] text-right">Số buổi</TableHead>
            <TableHead className="w-[12%] text-right">Tiết/buổi</TableHead>
            <TableHead className="w-[10%] text-right">Tổng tiết</TableHead>
            <TableHead className="w-[12%]">Trạng thái</TableHead>
            <TableHead className="w-[10%] px-4 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((tutorialClass) => (
            <TableRow key={tutorialClass.id}>
              <TableCell className="px-4 py-3 font-medium text-slate-900">
                {tutorialClass.courseCode}
              </TableCell>
              <TableCell className="py-3 text-slate-700">
                {tutorialClass.courseName}
              </TableCell>
              <TableCell className="py-3 text-right text-slate-700">
                {tutorialClass.studentCount}
              </TableCell>
              <TableCell className="py-3 text-right text-slate-700">
                {tutorialClass.totalSessions}
              </TableCell>
              <TableCell className="py-3 text-right text-slate-700">
                {tutorialClass.periodsPerSession}
              </TableCell>
              <TableCell className="py-3 text-right text-slate-700">
                {tutorialClass.totalPeriods}
              </TableCell>
              <TableCell className="py-3">
                <Badge
                  variant="outline"
                  className={cn(
                    'whitespace-nowrap font-semibold',
                    statusBadgeClassNames[tutorialClass.status]
                  )}
                >
                  {statusLabels[tutorialClass.status]}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex justify-end">
                  {tutorialClass.status === 'PLANNED' ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg border-slate-200 text-slate-600"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-44 p-1.5">
                        <div className="space-y-1">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-full justify-start rounded-md px-2 text-slate-700 hover:bg-slate-50"
                            onClick={() => onEdit(tutorialClass)}
                          >
                            <Pencil className="size-4" />
                            Sửa
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-full justify-start rounded-md px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => onCancel(tutorialClass)}
                          >
                            <XCircle className="size-4" />
                            Hủy
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : tutorialClass.status === 'CANCELLED' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg px-2.5"
                      onClick={() => onRestore(tutorialClass)}
                    >
                      <RotateCcw className="size-4" />
                      Khôi phục
                    </Button>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
