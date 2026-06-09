import type { UserScheduleItem } from '@/features/schedule-view/types'

const timetableRows = [
  { key: '1-3', start: 1, end: 3, label: 'Tiết 1-3' },
  { key: '4-6', start: 4, end: 6, label: 'Tiết 4-6' },
  { key: '7-9', start: 7, end: 9, label: 'Tiết 7-9' },
  { key: '10-12', start: 10, end: 12, label: 'Tiết 10-12' },
  { key: '13-15', start: 13, end: 15, label: 'Tiết 13-15' },
]

type WeekDayColumn = {
  dayOfWeek: number
  label: string
  dateLabel: string
}

type UserWeeklyScheduleTableProps = {
  items: UserScheduleItem[]
  weekDays: WeekDayColumn[]
  showLecturer: boolean
  showTutorialPeriod: boolean
}

const resolveRowKey = (startPeriod: number) => {
  const matchedRow = timetableRows.find(
    (row) => startPeriod >= row.start && startPeriod <= row.end
  )

  return matchedRow?.key ?? null
}

const formatRoomLabel = (item: UserScheduleItem) =>
  item.roomName || item.roomCode || 'Chưa có phòng'

export function UserWeeklyScheduleTable({
  items,
  weekDays,
  showLecturer,
  showTutorialPeriod,
}: UserWeeklyScheduleTableProps) {
  const itemsByCell = items.reduce<Record<string, UserScheduleItem[]>>(
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full table-fixed border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-28 border-b border-slate-200 px-3 py-2 text-left font-medium text-slate-700">
                Khung giờ
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.dayOfWeek}
                  className="border-b border-slate-200 px-3 py-2 text-left font-medium text-slate-700"
                >
                  <div className="space-y-0.5">
                    <p>{day.label}</p>
                    <p className="text-xs font-normal text-slate-500">{day.dateLabel}</p>
                  </div>
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
                {weekDays.map((day) => {
                  const cellItems = itemsByCell[`${day.dayOfWeek}-${row.key}`] ?? []

                  return (
                    <td
                      key={`${row.key}-${day.dayOfWeek}`}
                      className="border-b border-l border-slate-100 px-3 py-3"
                    >
                      {cellItems.length > 0 ? (
                        <div className="space-y-2">
                          {cellItems.map((item) => (
                            <div
                              key={item.id}
                              className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
                            >
                              <p className="break-words font-medium text-slate-900">
                                {item.courseName}
                              </p>
                              {showTutorialPeriod && item.tutorialPeriodTitle ? (
                                <p className="text-xs text-slate-500">
                                  Đợt: {item.tutorialPeriodTitle}
                                </p>
                              ) : null}
                              <p className="text-xs text-slate-600">
                                Tiết: {item.startPeriod}-{item.endPeriod}
                              </p>
                              {showLecturer ? (
                                <p className="text-xs text-slate-600">
                                  GV: {item.lecturerName || 'Chưa phân công'}
                                </p>
                              ) : null}
                              <p className="text-xs text-slate-500">
                                Phòng: {formatRoomLabel(item)}
                              </p>
                            </div>
                          ))}
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
  )
}
