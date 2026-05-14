import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { TutorialPeriod } from '@/features/tutorial-period/types'

const statusBadgeClassNames: Record<string, string> = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700',
  OPEN: 'border-blue-200 bg-blue-100 text-blue-700',
  ASSIGNING: 'border-amber-200 bg-amber-100 text-amber-700',
  ONGOING: 'border-emerald-200 bg-emerald-100 text-emerald-700',
  CLOSED: 'border-rose-200 bg-rose-100 text-rose-700',
}

interface TutorialPeriodTableProps {
  tutorialPeriods: TutorialPeriod[]
  onCreate: () => void
  onEdit: (tutorialPeriod: TutorialPeriod) => void
  onDelete: (tutorialPeriod: TutorialPeriod) => void
}

export function TutorialPeriodTable({
  tutorialPeriods,
  onCreate,
  onEdit,
  onDelete,
}: TutorialPeriodTableProps) {
  if (tutorialPeriods.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Chưa có đợt phụ đạo nào
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Tạo đợt phụ đạo đầu tiên để bắt đầu quản lý thời gian đăng ký và học tập.
        </p>
        <Button className="mt-5" onClick={onCreate}>
          Tạo đợt phụ đạo
        </Button>
      </div>
    )
  }

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
            const canEdit = tutorialPeriod.permissions?.can_edit ?? false
            const canDelete = tutorialPeriod.permissions?.can_delete ?? false

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
                  <div>{tutorialPeriod.start_reg_date}</div>
                  <div className="text-slate-400">đến {tutorialPeriod.end_reg_date}</div>
                </TableCell>
                <TableCell className="align-top text-sm text-slate-600">
                  {tutorialPeriod.created_by?.username ?? 'N/A'}
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
