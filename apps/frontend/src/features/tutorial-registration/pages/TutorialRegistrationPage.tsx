import { NotebookPen } from 'lucide-react'

import { StudentTutorialPeriodCard } from '@/features/tutorial-registration/components/StudentTutorialPeriodCard'
import { useStudentTutorialPeriods } from '@/features/tutorial-registration/hooks'
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

export default function TutorialRegistrationPage() {
  const tutorialPeriodsQuery = useStudentTutorialPeriods()

  const tutorialPeriods = tutorialPeriodsQuery.data?.data ?? []
  const isInitialLoading = tutorialPeriodsQuery.isPending && !tutorialPeriodsQuery.data

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Đăng ký phụ đạo
        </h1>
      </div>

      <div className="mt-4">
        {isInitialLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        ) : tutorialPeriodsQuery.isError ? (
          <ErrorState
            title="Không thể tải danh sách đợt phụ đạo"
            description={getApiErrorMessage(
              tutorialPeriodsQuery.error,
              'Vui lòng thử lại sau.'
            )}
          />
        ) : tutorialPeriods.length === 0 ? (
          <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-10 rounded-xl bg-slate-100 text-slate-600">
                <NotebookPen className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Chưa có đợt phụ đạo khả dụng</EmptyTitle>
              <EmptyDescription className="max-w-md text-sm text-slate-500">
                Hiện chưa có đợt phụ đạo nào để xem thông tin đăng ký.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {tutorialPeriods.map((tutorialPeriod) => (
              <StudentTutorialPeriodCard
                key={tutorialPeriod.id}
                tutorialPeriod={tutorialPeriod}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
