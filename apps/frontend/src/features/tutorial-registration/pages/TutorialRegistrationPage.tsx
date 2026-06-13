import { useState, useEffect, useMemo } from 'react'
import { NotebookPen, Bell } from 'lucide-react'

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { useNotifications } from '@/features/notifications/hooks'

export default function TutorialRegistrationPage() {
  const tutorialPeriodsQuery = useStudentTutorialPeriods()
  const notificationsQuery = useNotifications()

  const tutorialPeriods = tutorialPeriodsQuery.data?.data ?? []
  const notifications = notificationsQuery.data?.data ?? []
  const isInitialLoading = tutorialPeriodsQuery.isPending && !tutorialPeriodsQuery.data

  // Tìm tất cả các thông báo liên quan đến các đợt phụ đạo đang mở hiển thị trên trang
  const activeNotifications = useMemo(() => {
    if (!tutorialPeriods.length || !notifications.length) return []
    const filtered = notifications.filter((n) =>
      tutorialPeriods.some((p) => p.id === n.data.tutorialPeriodId)
    )

    const nowTime = new Date().getTime()
    return [...filtered].sort((a, b) => {
      const aDateStr = a.data.registrationStartAt ? a.data.registrationStartAt.replace(' ', 'T') : null
      const bDateStr = b.data.registrationStartAt ? b.data.registrationStartAt.replace(' ', 'T') : null

      const aStart = aDateStr ? new Date(aDateStr).getTime() : 0
      const bStart = bDateStr ? new Date(bDateStr).getTime() : 0

      // Nếu không có thời gian bắt đầu, đẩy xuống cuối
      const aDiff = aStart > 0 ? Math.abs(aStart - nowTime) : Infinity
      const bDiff = bStart > 0 ? Math.abs(bStart - nowTime) : Infinity

      return aDiff - bDiff
    })
  }, [tutorialPeriods, notifications])

  // Tìm các thông báo chưa được hiển thị trong phiên làm việc này
  const unseenNotifications = useMemo(() => {
    return activeNotifications.filter((n) => {
      const sessionKey = `seen_active_popup_${n.id}_${n.data.registrationStartAt}_${n.data.registrationEndAt}`
      return sessionStorage.getItem(sessionKey) !== 'true'
    })
  }, [activeNotifications])

  const [showActivePopup, setShowActivePopup] = useState(false)

  useEffect(() => {
    if (unseenNotifications.length > 0) {
      setShowActivePopup(true)
    }
  }, [unseenNotifications.length])

  const handleClosePopup = () => {
    setShowActivePopup(false)
    activeNotifications.forEach((n) => {
      const sessionKey = `seen_active_popup_${n.id}_${n.data.registrationStartAt}_${n.data.registrationEndAt}`
      sessionStorage.setItem(sessionKey, 'true')
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Đăng ký phụ đạo
        </h1>
      </div>

      <div className="mt-4">
        {activeNotifications.length > 0 && (
          <Dialog open={showActivePopup} onOpenChange={(open) => {
            if (!open) handleClosePopup()
          }}>
            <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl rounded-xl p-6">
              <DialogHeader className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Bell className="size-6 animate-bounce" />
                </div>
                <div className={`space-y-4 pt-2 ${
                  activeNotifications.length >= 3 
                    ? 'max-h-[300px] overflow-y-auto pr-2' 
                    : ''
                }`}>
                  {activeNotifications.map((notification, index) => (
                    <div key={notification.id} className="space-y-2">
                      {index > 0 && (
                        <div className="w-16 h-px bg-slate-200/60 mx-auto my-3" />
                      )}
                      <DialogTitle className="text-center text-lg font-semibold text-slate-950">
                        {notification.data.title}
                      </DialogTitle>
                      <DialogDescription className="text-center text-sm text-slate-600 leading-relaxed">
                        {notification.data.message}.
                      </DialogDescription>
                    </div>
                  ))}
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
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
