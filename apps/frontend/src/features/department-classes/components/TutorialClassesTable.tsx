import { MoreHorizontal, Pencil, RotateCcw, UserRound, XCircle, CalendarClock } from 'lucide-react'

import type { DepartmentTutorialClass } from '@/features/department-classes/types/departmentTutorialClass.types'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'

const statusLabels: Record<DepartmentTutorialClass['status'], string> = {
  PLANNED: 'Kế hoạch',
  ASSIGNED: 'Đã phân công',
  SCHEDULED: 'Đã xếp lịch',
  CANCELLED: 'Đã hủy',
}

const statusBadgeClassNames: Record<DepartmentTutorialClass['status'], string> = {
  PLANNED: 'border-slate-200 bg-slate-100 text-slate-700',
  ASSIGNED: 'border-amber-200 bg-amber-100 text-amber-700',
  SCHEDULED: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  CANCELLED: 'border-rose-200 bg-rose-100 text-rose-700',
}

const formatSchedule = (tutorialClass: DepartmentTutorialClass) => {
  if (tutorialClass.scheduleCount === 0 || tutorialClass.schedulePreview === null) {
    return 'Chưa xếp'
  }

  if (tutorialClass.scheduleCount > 1) {
    return `${tutorialClass.scheduleCount} buổi/tuần`
  }

  const { dayOfWeek, startPeriod, endPeriod } = tutorialClass.schedulePreview
  const dayLabel =
    dayOfWeek === 8 ? 'CN' : `Thứ ${dayOfWeek}`

  return `${dayLabel}, tiết ${startPeriod}-${endPeriod}`
}

type TutorialClassesTableProps = {
  classes: DepartmentTutorialClass[]
  canManage: boolean
  onAssignLecturer: (tutorialClass: DepartmentTutorialClass) => void
  onManageSchedules: (tutorialClass: DepartmentTutorialClass) => void
  onEdit: (tutorialClass: DepartmentTutorialClass) => void
  onCancel: (tutorialClass: DepartmentTutorialClass) => void
  onRestore: (tutorialClass: DepartmentTutorialClass) => void
}

export function TutorialClassesTable({
  classes,
  canManage,
  onAssignLecturer,
  onManageSchedules,
  onEdit,
  onCancel,
  onRestore,
}: TutorialClassesTableProps) {
  if (classes.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có lớp phụ đạo nào.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[10%] px-4">Mã môn</TableHead>
            <TableHead className="w-[22%]">Tên môn</TableHead>
            <TableHead className="w-[6%] text-right">SV</TableHead>
            <TableHead className="w-[7%] text-right">Buổi</TableHead>
            <TableHead className="w-[8%] text-right">Tiết/buổi</TableHead>
            <TableHead className="w-[8%] text-right">Tổng tiết</TableHead>
            <TableHead className="w-[14%]">Giảng viên</TableHead>
            <TableHead className="w-[16%]">Lịch học</TableHead>
            <TableHead className="w-[8%]">Trạng thái</TableHead>
            <TableHead className="w-[6%] px-4 text-right">Thao tác</TableHead>
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
              <TableCell className="py-3 text-slate-700">
                {tutorialClass.lecturerName ?? '—'}
              </TableCell>
              <TableCell className="py-3 text-slate-700">
                {formatSchedule(tutorialClass)}
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
                  {tutorialClass.status === 'CANCELLED' ? (
                    canManage ? (
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
                    )
                  ) : (
                    canManage ? (
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
                        <PopoverContent align="end" className="w-48 p-1.5">
                          <div className="space-y-1">
                            {tutorialClass.status === 'PLANNED' ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-9 w-full justify-start rounded-md px-2 text-slate-700 hover:bg-slate-50"
                                  onClick={() => onAssignLecturer(tutorialClass)}
                                >
                                  <UserRound className="size-4" />
                                  Phân công GV
                                </Button>
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
                              </>
                            ) : null}

                            {tutorialClass.status === 'ASSIGNED' ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-9 w-full justify-start rounded-md px-2 text-slate-700 hover:bg-slate-50"
                                  onClick={() => onManageSchedules(tutorialClass)}
                                >
                                  <CalendarClock className="size-4" />
                                  Quản lý lịch
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-9 w-full justify-start rounded-md px-2 text-slate-700 hover:bg-slate-50"
                                  onClick={() => onAssignLecturer(tutorialClass)}
                                >
                                  <UserRound className="size-4" />
                                  Đổi GV
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
                              </>
                            ) : null}

                            {tutorialClass.status === 'SCHEDULED' ? (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-9 w-full justify-start rounded-md px-2 text-slate-700 hover:bg-slate-50"
                                  onClick={() => onManageSchedules(tutorialClass)}
                                >
                                  <CalendarClock className="size-4" />
                                  Quản lý lịch
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-9 w-full justify-start rounded-md px-2 text-slate-700 hover:bg-slate-50"
                                  onClick={() => onAssignLecturer(tutorialClass)}
                                >
                                  <UserRound className="size-4" />
                                  Đổi GV
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
                              </>
                            ) : null}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )
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
