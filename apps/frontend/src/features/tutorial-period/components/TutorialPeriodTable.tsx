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
import type { TutorialPeriod } from '@/features/tutorial-period/types/tutorialPeriod.types'

const statusBadgeClassNames: Record<string, string> = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700',
  OPEN: 'border-blue-200 bg-blue-100 text-blue-700',
  ASSIGNING: 'border-amber-200 bg-amber-100 text-amber-700',
  ONGOING: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  CLOSED: 'border-rose-200 bg-rose-100 text-rose-700',
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
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="px-4">Tiêu đề</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thời gian đăng ký</TableHead>
            <TableHead>Người tạo</TableHead>
            <TableHead className="px-4 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tutorialPeriods.map((tutorialPeriod) => {
            const canEdit = tutorialPeriod.permissions?.canEdit ?? false
            const canDelete = tutorialPeriod.permissions?.canDelete ?? false

            return (
              <TableRow key={tutorialPeriod.id}>
                <TableCell className="px-4 align-top">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">
                      {tutorialPeriod.title}
                    </p>
                    <p className="line-clamp-2 max-w-xl text-sm text-slate-500">
                      {tutorialPeriod.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-semibold',
                      statusBadgeClassNames[tutorialPeriod.status]
                    )}
                  >
                    {tutorialPeriod.status}
                  </Badge>
                </TableCell>
                <TableCell className="align-top text-sm text-slate-600">
                  <div>{formatDate(tutorialPeriod.startRegDate) || 'N/A'}</div>
                  <div className="text-slate-400">
                    đến {formatDate(tutorialPeriod.endRegDate) || 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="align-top text-sm text-slate-600">
                  {tutorialPeriod.createdBy?.username ?? 'N/A'}
                </TableCell>
                <TableCell className="px-4 align-top">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(tutorialPeriod)}
                      disabled={!canEdit}
                    >
                      <Pencil />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(tutorialPeriod)}
                      disabled={!canDelete}
                    >
                      <Trash2 />
                      Xóa
                    </Button>
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
