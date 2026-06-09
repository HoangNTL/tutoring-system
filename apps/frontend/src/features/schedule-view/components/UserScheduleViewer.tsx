import { useState } from 'react'
import {
  addDays,
  endOfDay,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isValid,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { CalendarDays } from 'lucide-react'

import type { UserScheduleItem } from '@/features/schedule-view/types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { parseDateValue, toDateValue } from '@/shared/lib/date'
import { DatePickerField } from '@/shared/ui/date-picker-field'
import ErrorState from '@/shared/ui/error-state'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'

import { UserWeeklyScheduleTable } from './UserWeeklyScheduleTable'

type UserScheduleViewerProps = {
  title: string
  description: string
  items: UserScheduleItem[]
  isLoading: boolean
  isError: boolean
  error: unknown
  emptyTitle: string
  emptyDescription: string
  showLecturer: boolean
}

const timetableDays = [
  { dayOfWeek: 2, label: 'Thứ 2' },
  { dayOfWeek: 3, label: 'Thứ 3' },
  { dayOfWeek: 4, label: 'Thứ 4' },
  { dayOfWeek: 5, label: 'Thứ 5' },
  { dayOfWeek: 6, label: 'Thứ 6' },
  { dayOfWeek: 7, label: 'Thứ 7' },
  { dayOfWeek: 8, label: 'Chủ nhật' },
]

const getDayOffset = (dayOfWeek: number) => {
  if (dayOfWeek < 2 || dayOfWeek > 8) {
    return null
  }

  return dayOfWeek - 2
}

const isWithinInclusiveRange = (date: Date, start: Date, end: Date) =>
  !isBefore(date, start) && !isAfter(date, end)

const rangesOverlap = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) => !isAfter(startA, endB) && !isBefore(endA, startB)

export function UserScheduleViewer({
  title,
  description,
  items,
  isLoading,
  isError,
  error,
  emptyTitle,
  emptyDescription,
  showLecturer,
}: UserScheduleViewerProps) {
  const [selectedDateValue, setSelectedDateValue] = useState(() =>
    toDateValue(new Date())
  )

  const selectedDate = parseDateValue(selectedDateValue) ?? new Date()
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekStartDay = startOfDay(weekStart)
  const weekEndDay = endOfDay(weekEnd)

  const weekDays = timetableDays.map((day, index) => {
    const date = addDays(weekStart, index)

    return {
      dayOfWeek: day.dayOfWeek,
      label: day.label,
      dateLabel: format(date, 'dd/MM'),
      date,
    }
  })

  const tutorialPeriods = Array.from(
    items.reduce<
      Map<
        number,
        {
          id: number
          title: string
          studyStartAt: Date
          studyEndAt: Date
        }
      >
    >((map, item) => {
      if (
        item.tutorialPeriodId === null ||
        item.tutorialPeriodTitle === null ||
        item.studyStartAt === null ||
        item.studyEndAt === null
      ) {
        return map
      }

      const studyStartAt = parseDateValue(item.studyStartAt)
      const studyEndAt = parseDateValue(item.studyEndAt)

      if (!studyStartAt || !studyEndAt) {
        return map
      }

      if (!map.has(item.tutorialPeriodId)) {
        map.set(item.tutorialPeriodId, {
          id: item.tutorialPeriodId,
          title: item.tutorialPeriodTitle,
          studyStartAt: startOfDay(studyStartAt),
          studyEndAt: endOfDay(studyEndAt),
        })
      }

      return map
    }, new Map()).values()
  )

  const hasWeekOverlap = tutorialPeriods.some((tutorialPeriod) =>
    rangesOverlap(
      weekStartDay,
      weekEndDay,
      tutorialPeriod.studyStartAt,
      tutorialPeriod.studyEndAt
    )
  )

  const hasPartialWeekOverlap = tutorialPeriods.some((tutorialPeriod) => {
    if (
      !rangesOverlap(
        weekStartDay,
        weekEndDay,
        tutorialPeriod.studyStartAt,
        tutorialPeriod.studyEndAt
      )
    ) {
      return false
    }

    return (
      isAfter(tutorialPeriod.studyStartAt, weekStartDay) ||
      isBefore(tutorialPeriod.studyEndAt, weekEndDay)
    )
  })

  const weekItems = items.filter((item) => {
    const dayOffset = getDayOffset(item.dayOfWeek)
    const studyStartAt = parseDateValue(item.studyStartAt)
    const studyEndAt = parseDateValue(item.studyEndAt)

    if (
      dayOffset === null ||
      !studyStartAt ||
      !studyEndAt ||
      !isValid(studyStartAt) ||
      !isValid(studyEndAt)
    ) {
      return false
    }

    const studyDate = startOfDay(addDays(weekStart, dayOffset))

    return isWithinInclusiveRange(
      studyDate,
      startOfDay(studyStartAt),
      endOfDay(studyEndAt)
    )
  })

  const showTutorialPeriod =
    new Set(
      weekItems
        .map((item) => item.tutorialPeriodId)
        .filter((tutorialPeriodId): tutorialPeriodId is number => tutorialPeriodId !== null)
    ).size > 1

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${title}-week-picker`}
              className="text-sm font-medium text-slate-700"
            >
              Chọn tuần
            </label>
            <div className="w-full md:w-[320px]">
              <DatePickerField
                id={`${title}-week-picker`}
                value={selectedDateValue}
                onChange={setSelectedDateValue}
                placeholder="Chọn một ngày trong tuần"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">
              Tuần {format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM')}
            </p>
            <p className="text-sm text-slate-500">
              Lịch được tính theo lịch học hằng tuần đã được bộ môn thiết lập.
            </p>
            {hasPartialWeekOverlap ? (
              <p className="text-sm text-slate-500">
                Một phần tuần đã chọn nằm ngoài thời gian học của đợt phụ đạo.
              </p>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : isError ? (
          <ErrorState
            title={`Không thể tải ${title.toLowerCase()}`}
            description={getApiErrorMessage(error, 'Vui lòng thử lại sau.')}
          />
        ) : items.length === 0 ? (
          <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-10 rounded-xl bg-slate-100 text-slate-600"
              >
                <CalendarDays className="size-5" />
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription className="max-w-md text-sm text-slate-500">
                {emptyDescription}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : !hasWeekOverlap ? (
          <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-10 rounded-xl bg-slate-100 text-slate-600"
              >
                <CalendarDays className="size-5" />
              </EmptyMedia>
              <EmptyTitle>
                Tuần này không nằm trong thời gian học của đợt phụ đạo.
              </EmptyTitle>
              <EmptyDescription className="max-w-md text-sm text-slate-500">
                Hãy chọn tuần khác trong khoảng học đã được bộ môn thiết lập.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : weekItems.length === 0 ? (
          <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-10 rounded-xl bg-slate-100 text-slate-600"
              >
                <CalendarDays className="size-5" />
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription className="max-w-md text-sm text-slate-500">
                Không có buổi nào trong tuần đã chọn.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <UserWeeklyScheduleTable
            items={weekItems}
            weekDays={weekDays}
            showLecturer={showLecturer}
            showTutorialPeriod={showTutorialPeriod}
          />
        )}
      </div>
    </section>
  )
}
