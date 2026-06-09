import { useState } from 'react'
import { CalendarDays } from 'lucide-react'

import type { DepartmentWeeklyTimetableItem } from '@/features/department-classes/types/departmentTutorialClass.types'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

const timetableRows = [
  { key: '1-3', start: 1, end: 3, label: 'Tiết 1-3' },
  { key: '4-6', start: 4, end: 6, label: 'Tiết 4-6' },
  { key: '7-9', start: 7, end: 9, label: 'Tiết 7-9' },
  { key: '10-12', start: 10, end: 12, label: 'Tiết 10-12' },
  { key: '13-15', start: 13, end: 15, label: 'Tiết 13-15' },
]

const timetableDays = [
  { value: 2, label: 'Thứ 2' },
  { value: 3, label: 'Thứ 3' },
  { value: 4, label: 'Thứ 4' },
  { value: 5, label: 'Thứ 5' },
  { value: 6, label: 'Thứ 6' },
  { value: 7, label: 'Thứ 7' },
  { value: 8, label: 'Chủ nhật' },
]

type WeeklyTimetableProps = {
  items: DepartmentWeeklyTimetableItem[]
}

type TimetableCellPreview = {
  dayLabel: string
  rowLabel: string
  items: DepartmentWeeklyTimetableItem[]
}

export function WeeklyTimetable({ items }: WeeklyTimetableProps) {
  const [selectedCell, setSelectedCell] = useState<TimetableCellPreview | null>(null)

  if (items.length === 0) {
    return (
      <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-10 rounded-xl bg-slate-100 text-slate-600"
          >
            <CalendarDays className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Chưa có lịch học nào trong đợt này.</EmptyTitle>
          <EmptyDescription className="max-w-md text-sm text-slate-500">
            Thời khóa biểu tuần sẽ hiển thị tại đây khi lớp phụ đạo đã được xếp lịch.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const resolveRowKey = (startPeriod: number) => {
    const matchedRow = timetableRows.find(
      (row) => startPeriod >= row.start && startPeriod <= row.end
    )

    return matchedRow?.key ?? null
  }

  const formatRoomLabel = (item: DepartmentWeeklyTimetableItem) =>
    item.roomName || item.roomCode || 'Chưa có phòng'

  const itemsByCell = items.reduce<Record<string, DepartmentWeeklyTimetableItem[]>>(
    (accumulator, item) => {
      const rowKey = resolveRowKey(item.startPeriod)

      if (!rowKey) {
        return accumulator
      }

      const cellKey = `${item.dayOfWeek}-${rowKey}`

      if (!accumulator[cellKey]) {
        accumulator[cellKey] = []
      }

      accumulator[cellKey].push(item)
      accumulator[cellKey].sort((left, right) => {
        if (left.startPeriod !== right.startPeriod) {
          return left.startPeriod - right.startPeriod
        }

        return left.courseName.localeCompare(right.courseName, 'vi')
      })

      return accumulator
    },
    {}
  )

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full table-fixed border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-28 border-b border-slate-200 px-3 py-2 text-left font-medium text-slate-700">
                  Khung giờ
                </th>
                {timetableDays.map((day) => (
                  <th
                    key={day.value}
                    className="border-b border-slate-200 px-3 py-2 text-left font-medium text-slate-700"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetableRows.map((row) => (
                <tr key={row.key} className="align-top">
                  <td className="border-b border-slate-200 px-3 py-3 font-medium text-slate-700">
                    {row.label}
                  </td>
                  {timetableDays.map((day) => {
                    const cellItems = itemsByCell[`${day.value}-${row.key}`] ?? []
                    const visibleItems = cellItems.slice(0, 2)
                    const hiddenCount = cellItems.length - visibleItems.length

                    return (
                      <td
                        key={`${row.key}-${day.value}`}
                        className="border-b border-l border-slate-100 px-3 py-3"
                      >
                        {cellItems.length > 0 ? (
                          <div className="space-y-2">
                            {visibleItems.map((item) => (
                              <div
                                key={item.id}
                                className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
                              >
                                <p className="break-words font-medium text-slate-900">
                                  {item.courseName}
                                </p>
                                <p className="text-xs text-slate-600">
                                  Tiết: {item.startPeriod}-{item.endPeriod}
                                </p>
                                <p className="text-xs text-slate-600">
                                  GV: {item.lecturerName || 'Chưa phân công'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Phòng: {formatRoomLabel(item)}
                                </p>
                              </div>
                            ))}
                            {hiddenCount > 0 ? (
                              <button
                                type="button"
                                className="text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                                onClick={() =>
                                  setSelectedCell({
                                    dayLabel: day.label,
                                    rowLabel: row.label,
                                    items: cellItems,
                                  })
                                }
                              >
                                +{hiddenCount} lớp khác
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={selectedCell !== null} onOpenChange={(open) => !open && setSelectedCell(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Chi tiết ô thời khóa biểu</DialogTitle>
            <DialogDescription>
              {selectedCell
                ? `${selectedCell.dayLabel} · ${selectedCell.rowLabel}`
                : 'Danh sách lớp trong cùng khung giờ'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedCell?.items.map((item) => (
              <div
                key={item.id}
                className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p className="font-medium text-slate-900">{item.courseName}</p>
                <p className="text-sm text-slate-600">
                  Tiết {item.startPeriod}-{item.endPeriod}
                </p>
                <p className="text-sm text-slate-600">
                  GV: {item.lecturerName || 'Chưa phân công'}
                </p>
                <p className="text-sm text-slate-500">Phòng: {formatRoomLabel(item)}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
