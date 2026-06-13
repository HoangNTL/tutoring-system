import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useCancelStudentTutorialCourseMutation,
  useRegisterStudentTutorialCourseMutation,
  useStudentTutorialRegistrationInfo,
} from '@/features/tutorial-registration/hooks'
import { AvailableCoursesTable } from '@/features/tutorial-registration/components/AvailableCoursesTable'
import { RegisteredCoursesTable } from '@/features/tutorial-registration/components/RegisteredCoursesTable'
import { getApiErrorMessage } from '@/shared/api/errors'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
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
  const registerMutation = useRegisterStudentTutorialCourseMutation()
  const cancelMutation = useCancelStudentTutorialCourseMutation()
  const [actionError, setActionError] = useState<string | null>(null)
  const [courseToCancel, setCourseToCancel] = useState<{
    courseCode: string
    courseName: string
  } | null>(null)

  const registrationInfo = registrationInfoQuery.data?.data
  const tutorialPeriod = registrationInfo?.tutorialPeriod
  const permissions = registrationInfo?.permissions
  const isInitialLoading = registrationInfoQuery.isPending && !registrationInfoQuery.data
  const isRegistrationNotStarted = useMemo(() => {
    if (!tutorialPeriod?.registrationStartAt) return false
    return new Date(tutorialPeriod.registrationStartAt) > new Date()
  }, [tutorialPeriod])

  const subtitle = tutorialPeriod
    ? [
        tutorialPeriod.academicPeriod?.name ?? 'Học kỳ chưa xác định',
        tutorialPeriod.title,
      ].join(' · ')
    : null
  const registeredCourseCodes = useMemo(
    () => new Set((registrationInfo?.registeredCourses ?? []).map((course) => course.courseCode)),
    [registrationInfo?.registeredCourses]
  )
  const availableCourses = useMemo(
    () =>
      (registrationInfo?.availableCourses ?? []).filter(
        (course) => !registeredCourseCodes.has(course.courseCode)
      ),
    [registrationInfo?.availableCourses, registeredCourseCodes]
  )
  const isRegistrationClosed =
    !!tutorialPeriod &&
    tutorialPeriod.status !== 'OPEN' &&
    (permissions?.canViewRegistrationInfo ?? false)

  const handleRegister = async (courseCode: string) => {
    if (!Number.isFinite(tutorialPeriodId)) {
      return
    }

    setActionError(null)

    try {
      await registerMutation.mutateAsync({ tutorialPeriodId, courseCode })
      toast.success('Đăng ký môn học thành công.')
    } catch (error) {
      setActionError(getApiErrorMessage(error, 'Không thể đăng ký môn học.'))
    }
  }

  const handleCancel = async (courseCode: string) => {
    if (!Number.isFinite(tutorialPeriodId)) {
      return
    }

    setActionError(null)

    try {
      await cancelMutation.mutateAsync({ tutorialPeriodId, courseCode })
      setCourseToCancel(null)
      toast.success('Hủy đăng ký môn học thành công.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể hủy đăng ký môn học.')
      setActionError(message)
      toast.error(message)
    }
  }

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
              {actionError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {actionError}
                </div>
              ) : null}

              {isRegistrationClosed ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Đợt phụ đạo đã kết thúc giai đoạn đăng ký. Bạn chỉ có thể xem thông tin đã đăng ký.
                </div>
              ) : null}

              {isRegistrationNotStarted ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Đợt đăng ký này chưa chính thức bắt đầu. Bạn chưa thể đăng ký hoặc hủy đăng ký môn học vào thời điểm này.
                </div>
              ) : null}

              {permissions?.canViewSchedule ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Lịch học của bạn đã có sẵn trong hệ thống. Bạn có thể xem ở trang lịch học.
                </div>
              ) : null}

              {permissions?.canRegister ? (
                <div className="border-t border-slate-200 pt-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-slate-950">
                      Có thể đăng ký
                    </h3>
                  </div>
                  <AvailableCoursesTable
                    courses={availableCourses}
                    canRegister={permissions.canRegister}
                    isRegistrationDisabled={isRegistrationNotStarted}
                    registeringCourseCode={registerMutation.isPending ? registerMutation.variables?.courseCode ?? null : null}
                    onRegister={(courseCode) => {
                      void handleRegister(courseCode)
                    }}
                  />
                </div>
              ) : null}

              <div className="border-t border-slate-200 pt-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    Đã đăng ký
                  </h3>
                </div>
                <RegisteredCoursesTable
                  courses={registrationInfo.registeredCourses}
                  canCancel={permissions?.canCancelRegistration ?? false}
                  cancellingCourseCode={cancelMutation.isPending ? cancelMutation.variables?.courseCode ?? null : null}
                  isCancellationDisabled={isRegistrationNotStarted}
                  onCancel={(courseCode) => {
                    const course = registrationInfo.registeredCourses.find(
                      (item) => item.courseCode === courseCode
                    )

                    setCourseToCancel({
                      courseCode,
                      courseName: course?.courseName ?? courseCode,
                    })
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={courseToCancel !== null}
        onOpenChange={(open) => {
          if (!open && !cancelMutation.isPending) {
            setCourseToCancel(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đăng ký môn học</AlertDialogTitle>
            <AlertDialogDescription>
              {courseToCancel
                ? `Bạn có chắc muốn hủy đăng ký môn '${courseToCancel.courseName}'?`
                : 'Xác nhận hủy đăng ký môn học.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Đóng
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()

                if (!courseToCancel) {
                  return
                }

                void handleCancel(courseToCancel.courseCode)
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
