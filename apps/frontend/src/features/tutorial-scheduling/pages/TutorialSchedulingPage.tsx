import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'

import { WeeklyTimetable } from '@/features/department-classes/components/WeeklyTimetable'
import { useDepartmentWeeklyTimetable } from '@/features/department-classes/hooks'
import type { DepartmentWeeklyTimetableItem } from '@/features/department-classes/types/departmentTutorialClass.types'
import { useDepartmentTutorialPeriods } from '@/features/department-registration/hooks'
import type { DepartmentTutorialPeriodOption } from '@/features/department-registration/types/departmentTutorialRegistration.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { Button } from '@/shared/ui/button'
import ErrorState from '@/shared/ui/error-state'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

type TimetableViewMode = 'class' | 'course' | 'lecturer'

export default function TutorialSchedulingPage() {
  const [requestedTutorialPeriodId, setRequestedTutorialPeriodId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<TimetableViewMode>('class')
  const [requestedClassId, setRequestedClassId] = useState<number | null>(null)
  const [requestedCourseCode, setRequestedCourseCode] = useState<string | null>(null)
  const [requestedLecturerId, setRequestedLecturerId] = useState<number | null>(null)

  const tutorialPeriodsQuery = useDepartmentTutorialPeriods()
  const tutorialPeriods = tutorialPeriodsQuery.data?.data ?? []
  const selectedTutorialPeriodId =
    requestedTutorialPeriodId !== null &&
    tutorialPeriods.some((tutorialPeriod) => tutorialPeriod.id === requestedTutorialPeriodId)
      ? requestedTutorialPeriodId
      : tutorialPeriods[0]?.id ?? null

  const timetableQuery = useDepartmentWeeklyTimetable(selectedTutorialPeriodId)
  const timetableItems = useMemo(
    () => timetableQuery.data?.data ?? [],
    [timetableQuery.data]
  )
  const classOptions = useMemo(
    () =>
      Array.from(
        timetableItems.reduce<Map<number, { id: number; label: string }>>((map, item) => {
          if (!map.has(item.classId)) {
            map.set(item.classId, {
              id: item.classId,
              label: item.courseName,
            })
          }

          return map
        }, new Map()).values()
      ).sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    [timetableItems]
  )
  const courseOptions = useMemo(
    () =>
      Array.from(
        timetableItems.reduce<Map<string, { code: string; label: string }>>((map, item) => {
          if (!map.has(item.courseCode)) {
            map.set(item.courseCode, {
              code: item.courseCode,
              label: item.courseName,
            })
          }

          return map
        }, new Map()).values()
      ).sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    [timetableItems]
  )
  const lecturerOptions = useMemo(
    () =>
      Array.from(
        timetableItems.reduce<Map<number, { id: number; label: string }>>((map, item) => {
          if (item.lecturerId === null || item.lecturerName.trim() === '') {
            return map
          }

          if (!map.has(item.lecturerId)) {
            map.set(item.lecturerId, {
              id: item.lecturerId,
              label: item.lecturerName,
            })
          }

          return map
        }, new Map()).values()
      ).sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    [timetableItems]
  )
  const selectedClassId =
    requestedClassId !== null && classOptions.some((option) => option.id === requestedClassId)
      ? requestedClassId
      : null
  const selectedCourseCode =
    requestedCourseCode !== null &&
    courseOptions.some((option) => option.code === requestedCourseCode)
      ? requestedCourseCode
      : null
  const selectedLecturerId =
    requestedLecturerId !== null &&
    lecturerOptions.some((option) => option.id === requestedLecturerId)
      ? requestedLecturerId
      : null
  const filteredTimetableItems = useMemo<DepartmentWeeklyTimetableItem[]>(() => {
    if (viewMode === 'course') {
      return selectedCourseCode === null
        ? []
        : timetableItems.filter((item) => item.courseCode === selectedCourseCode)
    }

    if (viewMode === 'class') {
      return selectedClassId === null
        ? []
        : timetableItems.filter((item) => item.classId === selectedClassId)
    }

    if (viewMode === 'lecturer') {
      return selectedLecturerId === null
        ? []
        : timetableItems.filter((item) => item.lecturerId === selectedLecturerId)
    }

    return timetableItems
  }, [selectedClassId, selectedCourseCode, selectedLecturerId, timetableItems, viewMode])

  const isSelectionRequired =
    (viewMode === 'class' && selectedClassId === null) ||
    (viewMode === 'course' && selectedCourseCode === null) ||
    (viewMode === 'lecturer' && selectedLecturerId === null)

  const handleViewModeChange = (mode: TimetableViewMode) => {
    setViewMode(mode)

    if (mode !== 'class') {
      setRequestedClassId(null)
    }

    if (mode !== 'course') {
      setRequestedCourseCode(null)
    }

    if (mode !== 'lecturer') {
      setRequestedLecturerId(null)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Xếp lịch
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi toàn bộ lớp phụ đạo đã được xếp lịch trong đợt đang chọn. Việc
            thêm, sửa, xóa lịch học được thực hiện tại Lớp phụ đạo - Quản lý lịch.
          </p>
        </div>

        <div className="space-y-4 pt-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Đợt phụ đạo</label>
            <Select
              value={selectedTutorialPeriodId?.toString() ?? ''}
              onValueChange={(value) => {
                setRequestedTutorialPeriodId(Number(value))
                setRequestedClassId(null)
                setRequestedCourseCode(null)
                setRequestedLecturerId(null)
              }}
              disabled={tutorialPeriods.length === 0}
            >
              <SelectTrigger className="h-9 w-full md:w-[460px] lg:w-[520px]">
                <SelectValue placeholder="Chọn đợt phụ đạo" />
              </SelectTrigger>
              <SelectContent>
                {tutorialPeriods.map((tutorialPeriod: DepartmentTutorialPeriodOption) => (
                  <SelectItem
                    key={tutorialPeriod.id}
                    value={tutorialPeriod.id.toString()}
                  >
                    {tutorialPeriod.academicPeriod?.name
                      ? `${tutorialPeriod.academicPeriod.name} · ${tutorialPeriod.title}`
                      : tutorialPeriod.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Xem lịch theo</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={viewMode === 'class' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('class')}
                >
                  Theo lớp
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'course' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('course')}
                >
                  Theo môn
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'lecturer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('lecturer')}
                >
                  Theo giảng viên
                </Button>
              </div>
            </div>

            {viewMode === 'class' ? (
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Lớp phụ đạo</label>
                <Select
                  value={selectedClassId?.toString() ?? ''}
                  onValueChange={(value) => setRequestedClassId(Number(value))}
                  disabled={classOptions.length === 0}
                >
                  <SelectTrigger className="h-9 w-full md:w-[460px] lg:w-[520px]">
                    <SelectValue
                      placeholder={
                        classOptions.length === 0
                          ? 'Chưa có lớp nào đã xếp lịch'
                          : 'Chọn lớp phụ đạo'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {viewMode === 'course' ? (
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Môn học</label>
                <Select
                  value={selectedCourseCode ?? ''}
                  onValueChange={setRequestedCourseCode}
                  disabled={courseOptions.length === 0}
                >
                  <SelectTrigger className="h-9 w-full md:w-[460px] lg:w-[520px]">
                    <SelectValue
                      placeholder={
                        courseOptions.length === 0
                          ? 'Chưa có môn học nào đã xếp lịch'
                          : 'Chọn môn học'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {courseOptions.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {viewMode === 'lecturer' ? (
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Giảng viên</label>
                <Select
                  value={selectedLecturerId?.toString() ?? ''}
                  onValueChange={(value) => setRequestedLecturerId(Number(value))}
                  disabled={lecturerOptions.length === 0}
                >
                  <SelectTrigger className="h-9 w-full md:w-[460px] lg:w-[520px]">
                    <SelectValue
                      placeholder={
                        lecturerOptions.length === 0
                          ? 'Chưa có giảng viên nào trong thời khóa biểu'
                          : 'Chọn giảng viên'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturerOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          {tutorialPeriodsQuery.isPending && !tutorialPeriodsQuery.data ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
            </div>
          ) : tutorialPeriodsQuery.isError ? (
            <ErrorState
              title="Không thể tải đợt phụ đạo"
              description={getApiErrorMessage(
                tutorialPeriodsQuery.error,
                'Vui lòng thử lại sau.'
              )}
            />
          ) : tutorialPeriods.length === 0 ? (
            <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-10 rounded-xl bg-slate-100 text-slate-600"
                >
                  <CalendarDays className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có đợt phụ đạo phù hợp</EmptyTitle>
                <EmptyDescription className="max-w-md text-sm text-slate-500">
                  Thời khóa biểu tuần sẽ hiển thị sau khi có đợt phụ đạo phù hợp.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : timetableQuery.isPending && !timetableQuery.data ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
            </div>
          ) : timetableQuery.isError ? (
            <ErrorState
              title="Không thể tải thời khóa biểu"
              description={getApiErrorMessage(
                timetableQuery.error,
                'Vui lòng thử lại sau.'
              )}
            />
          ) : timetableItems.length === 0 ? (
            <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-10 rounded-xl bg-slate-100 text-slate-600"
                >
                  <CalendarDays className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có lịch học.</EmptyTitle>
                <EmptyDescription className="max-w-md text-sm text-slate-500">
                  Đợt phụ đạo này chưa có lớp nào được xếp lịch.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : isSelectionRequired ? (
            <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-10 rounded-xl bg-slate-100 text-slate-600"
                >
                  <CalendarDays className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Vui lòng chọn đối tượng để xem lịch.</EmptyTitle>
                <EmptyDescription className="max-w-md text-sm text-slate-500">
                  Chọn lớp phụ đạo, môn học hoặc giảng viên để xem thời khóa biểu tương ứng.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : filteredTimetableItems.length === 0 ? (
            <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-10 rounded-xl bg-slate-100 text-slate-600"
                >
                  <CalendarDays className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có lịch học.</EmptyTitle>
                <EmptyDescription className="max-w-md text-sm text-slate-500">
                  Đối tượng đã chọn hiện chưa có lịch trong đợt phụ đạo này.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <WeeklyTimetable items={filteredTimetableItems} />
          )}
        </div>
      </div>
    </div>
  )
}
