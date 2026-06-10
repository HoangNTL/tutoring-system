import { Pencil, Trash2 } from 'lucide-react'

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
}

export function TutorialPeriodTable({
  tutorialPeriods,
  onEdit,
  onDelete,
}: TutorialPeriodTableProps) {
  const formatDateRange = (
    startAt: string | null,
    endAt: string | null
  ) => {
    const start = formatDate(startAt)
    const end = formatDate(endAt)

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
            <TableHead className="w-[22%] px-4">Học kỳ</TableHead>
            <TableHead className="w-[24%]">Tiêu đề</TableHead>
            <TableHead className="w-[18%]">Thời gian đăng ký</TableHead>
            <TableHead className="w-[18%]">Thời gian học</TableHead>
            <TableHead className="w-[10%]">Trạng thái</TableHead>
            <TableHead className="w-[8%] px-4 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tutorialPeriods.map((tutorialPeriod) => {
            const canEdit = tutorialPeriod.permissions?.canEdit ?? false
            const canDelete = tutorialPeriod.permissions?.canDelete ?? false

            return (
              <TableRow key={tutorialPeriod.id}>
                <TableCell className="px-4 py-3 align-top text-sm text-slate-600">
                  {tutorialPeriod.academicPeriod?.name ?? 'N/A'}
                </TableCell>
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
                <TableCell className="py-3 align-top text-sm text-slate-600">
                  <span className="whitespace-nowrap text-slate-700">
                    {formatDateRange(
                      tutorialPeriod.registrationStartAt,
                      tutorialPeriod.registrationEndAt
                    )}
                  </span>
                </TableCell>
                <TableCell className="py-3 align-top text-sm text-slate-600">
                  <span className="whitespace-nowrap text-slate-700">
                    {formatDateRange(
                      tutorialPeriod.studyStartAt,
                      tutorialPeriod.studyEndAt
                    )}
                  </span>
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
                <TableCell className="px-4 py-3 align-top">
                  <div className="flex justify-end gap-1.5">
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

                    {canDelete ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg border-red-200 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDelete(tutorialPeriod)}
                      >
                        <Trash2 />
                        Xóa
                      </Button>
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
