import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useStudentTutorialRegistrationInfo } from '@/features/tutorial-registration/hooks'
import { AvailableCoursesTable } from '@/features/tutorial-registration/components/AvailableCoursesTable'
import { RegisteredCoursesTable } from '@/features/tutorial-registration/components/RegisteredCoursesTable'
import { getApiErrorMessage } from '@/shared/api/errors'
import { Button } from '@/shared/ui/button'
import ErrorState from '@/shared/ui/error-state'
import { Skeleton } from '@/shared/ui/skeleton'

export default function TutorialRegistrationDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ tutorialPeriodId: string }>()
  const tutorialPeriodId = Number(params.tutorialPeriodId)

  const registrationInfoQuery = useStudentTutorialRegistrationInfo(
    Number.isFinite(tutorialPeriodId) ? tutorialPeriodId : null
  )

  const registrationInfo = registrationInfoQuery.data?.data
  const tutorialPeriod = registrationInfo?.tutorialPeriod
  const isInitialLoading = registrationInfoQuery.isPending && !registrationInfoQuery.data
  const subtitle = tutorialPeriod
    ? [
        tutorialPeriod.academicPeriod?.name ?? 'Học kỳ chưa xác định',
        tutorialPeriod.title,
      ].join(' · ')
    : null

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Đăng ký phụ đạo
            </h1>
            {subtitle ? (
              <p className="text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() => navigate('/tutorial-registration')}
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </Button>
        </div>

        <div className="mt-4">
          {isInitialLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          ) : registrationInfoQuery.isError || !tutorialPeriod ? (
            <ErrorState
              title="Không thể tải thông tin đăng ký"
              description={getApiErrorMessage(
                registrationInfoQuery.error,
                'Vui lòng thử lại sau.'
              )}
            />
          ) : (
            <div className="space-y-6">
              <div className="border-t border-slate-200 pt-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    Có thể đăng ký
                  </h3>
                </div>
                <AvailableCoursesTable courses={registrationInfo.availableCourses} />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    Đã đăng ký
                  </h3>
                </div>
                <RegisteredCoursesTable courses={registrationInfo.registeredCourses} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
