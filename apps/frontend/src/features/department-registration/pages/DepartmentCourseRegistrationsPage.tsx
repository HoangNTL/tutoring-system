import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'

import {
  useDepartmentCourseRegistrationSummary,
  useDepartmentRegisteredStudents,
  useDepartmentTutorialPeriods,
} from '@/features/department-registration/hooks'
import { CourseRegistrationSummaryTable } from '@/features/department-registration/components/CourseRegistrationSummaryTable'
import { RegisteredStudentsDialog } from '@/features/department-registration/components/RegisteredStudentsDialog'
import type {
  DepartmentCourseRegistrationSummary,
  DepartmentTutorialPeriodOption,
} from '@/features/department-registration/types/departmentTutorialRegistration.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import ErrorState from '@/shared/ui/error-state'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

export default function DepartmentCourseRegistrationsPage() {
  const [selectedTutorialPeriodId, setSelectedTutorialPeriodId] = useState<number | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<DepartmentCourseRegistrationSummary | null>(null)
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false)

  const tutorialPeriodsQuery = useDepartmentTutorialPeriods()
  const tutorialPeriods = tutorialPeriodsQuery.data?.data ?? []

  const summaryQuery = useDepartmentCourseRegistrationSummary(selectedTutorialPeriodId)
  const summaryItems = summaryQuery.data?.data ?? []

  const studentsQuery = useDepartmentRegisteredStudents(
    selectedTutorialPeriodId,
    selectedCourse?.courseCode ?? null,
    isStudentsDialogOpen
  )

  useEffect(() => {
    if (tutorialPeriods.length === 0) {
      setSelectedTutorialPeriodId(null)
      return
    }

    const hasCurrentSelection = tutorialPeriods.some(
      (tutorialPeriod) => tutorialPeriod.id === selectedTutorialPeriodId
    )

    if (!hasCurrentSelection) {
      setSelectedTutorialPeriodId(tutorialPeriods[0].id)
    }
  }, [tutorialPeriods, selectedTutorialPeriodId])

  const handleViewStudents = (course: DepartmentCourseRegistrationSummary) => {
    setSelectedCourse(course)
    setIsStudentsDialogOpen(true)
  }

  const isInitialLoading = tutorialPeriodsQuery.isPending && !tutorialPeriodsQuery.data

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Môn học đăng ký
          </h1>
        </div>

        <div className="pt-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Đợt phụ đạo
            </label>
            <Select
              value={selectedTutorialPeriodId?.toString() ?? ''}
              onValueChange={(value) => setSelectedTutorialPeriodId(Number(value))}
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
                    className="max-w-[520px]"
                  >
                    {tutorialPeriod.academicPeriod?.name
                      ? `${tutorialPeriod.academicPeriod.name} · ${tutorialPeriod.title}`
                      : tutorialPeriod.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          {isInitialLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
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
                  <ClipboardList className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có đợt phụ đạo phù hợp</EmptyTitle>
                <EmptyDescription className="max-w-md text-sm text-slate-500">
                  Danh sách đợt phụ đạo dành cho bộ môn sẽ hiển thị tại đây.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : summaryQuery.isPending && !summaryQuery.data ? (
            <div className="space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : summaryQuery.isError ? (
            <ErrorState
              title="Không thể tải môn học đăng ký"
              description={getApiErrorMessage(
                summaryQuery.error,
                'Vui lòng thử lại sau.'
              )}
            />
          ) : (
            <CourseRegistrationSummaryTable
              items={summaryItems}
              onViewStudents={handleViewStudents}
            />
          )}
        </div>
      </div>

      <RegisteredStudentsDialog
        open={isStudentsDialogOpen}
        course={selectedCourse}
        students={studentsQuery.data?.data ?? []}
        isLoading={studentsQuery.isPending}
        errorMessage={
          studentsQuery.isError
            ? getApiErrorMessage(studentsQuery.error, 'Vui lòng thử lại sau.')
            : null
        }
        onOpenChange={(open) => {
          setIsStudentsDialogOpen(open)
          if (!open) {
            setSelectedCourse(null)
          }
        }}
      />
    </div>
  )
}
