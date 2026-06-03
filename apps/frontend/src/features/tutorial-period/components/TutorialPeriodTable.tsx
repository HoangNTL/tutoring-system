import { MoreHorizontal, Pencil, Play, Trash2, XCircle } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { formatDate } from '@/shared/lib/date'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@/shared/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import {
  tutorialPeriodStatusLabels,
  type TutorialPeriod,
} from '@/features/tutorial-period/types/tutorialPeriod.types'

const statusBadgeClassNames: Record<string, string> = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700',
  OPEN: 'border-sky-200 bg-sky-100 text-sky-700',
  ASSIGNING: 'border-amber-200 bg-amber-100 text-amber-700',
  ONGOING: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  CLOSED: 'border-slate-300 bg-slate-200 text-slate-700',
  CANCELLED: 'border-rose-200 bg-rose-100 text-rose-700',
}

interface TutorialPeriodTableProps {
  tutorialPeriods: TutorialPeriod[]
  onEdit: (tutorialPeriod: TutorialPeriod) => void
  onDelete: (tutorialPeriod: TutorialPeriod) => void
  onOpen: (tutorialPeriod: TutorialPeriod) => void
  onCancel: (tutorialPeriod: TutorialPeriod) => void
}

export function TutorialPeriodTable({
  tutorialPeriods,
  onEdit,
  onDelete,
  onOpen,
  onCancel,
}: TutorialPeriodTableProps) {
  const formatRegistrationRange = (
    registrationStartAt: string | null,
    registrationEndAt: string | null
  ) => {
    const start = formatDate(registrationStartAt)
    const end = formatDate(registrationEndAt)

    if (!start && !end) {
      return 'N/A'
    }

    if (!start || !end) {
      return start || end
    }

    return `${start} - ${end}`
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[32%] px-4">Tiêu đề</TableHead>
            <TableHead className="w-[14%]">Trạng thái</TableHead>
            <TableHead className="w-[18%]">Học kỳ</TableHead>
            <TableHead className="w-[18%]">Đăng ký</TableHead>
            <TableHead className="w-[10%]">Người tạo</TableHead>
            <TableHead className="w-[8%] px-4 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tutorialPeriods.map((tutorialPeriod) => {
            const canEdit = tutorialPeriod.permissions?.canEdit ?? false
            const canDelete = tutorialPeriod.permissions?.canDelete ?? false
            const canOpen = tutorialPeriod.permissions?.canOpen ?? false
            const canCancel = tutorialPeriod.permissions?.canCancel ?? false

            return (
              <TableRow key={tutorialPeriod.id}>
                <TableCell className="px-4 py-3 align-top">
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">
                      {tutorialPeriod.title}
                    </p>
                    <p className="line-clamp-1 max-w-xl text-sm text-slate-500">
                      {tutorialPeriod.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-3 align-top">
                  <Badge
                    variant="outline"
                    className={cn(
                      'whitespace-nowrap font-semibold',
                      statusBadgeClassNames[tutorialPeriod.status]
                    )}
                  >
                    {tutorialPeriodStatusLabels[tutorialPeriod.status]}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 align-top text-sm text-slate-600">
                  {tutorialPeriod.academicPeriod?.name ?? 'N/A'}
                </TableCell>
                <TableCell className="py-3 align-top text-sm text-slate-600">
                  <span className="whitespace-nowrap">
                    {formatRegistrationRange(
                      tutorialPeriod.registrationStartAt,
                      tutorialPeriod.registrationEndAt
                    )}
                  </span>
                </TableCell>
                <TableCell className="py-3 align-top text-sm text-slate-600">
                  {tutorialPeriod.createdBy?.username ?? 'N/A'}
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <div className="flex justify-end gap-1.5">
                    {canOpen ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg px-2.5"
                        onClick={() => onOpen(tutorialPeriod)}
                      >
                        <Play />
                        Mở
                      </Button>
                    ) : null}

                    {canEdit ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg px-2.5"
                        onClick={() => onEdit(tutorialPeriod)}
                      >
                        <Pencil />
                        Sửa
                      </Button>
                    ) : null}

                    {canCancel || canDelete ? (
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
                            {canCancel ? (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-9 w-full justify-start rounded-md px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => onCancel(tutorialPeriod)}
                              >
                                <XCircle className="size-4" />
                                Hủy đợt
                              </Button>
                            ) : null}

                            {canDelete ? (
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-9 w-full justify-start rounded-md px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => onDelete(tutorialPeriod)}
                              >
                                <Trash2 className="size-4" />
                                Xóa
                              </Button>
                            ) : null}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
