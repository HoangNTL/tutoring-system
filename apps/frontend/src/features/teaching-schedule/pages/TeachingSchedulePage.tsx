import { UserScheduleViewer } from '@/features/schedule-view/components/UserScheduleViewer'
import { useLecturerSchedules } from '@/features/schedule-view/hooks'

export default function TeachingSchedulePage() {
  const schedulesQuery = useLecturerSchedules()

  return (
    <UserScheduleViewer
      title="Lịch dạy"
      description="Theo dõi lịch dạy theo tuần đã chọn từ các khung giờ hằng tuần mà bộ môn đã xếp cho các lớp phụ đạo của bạn."
      items={schedulesQuery.data?.data ?? []}
      isLoading={schedulesQuery.isPending && !schedulesQuery.data}
      isError={schedulesQuery.isError}
      error={schedulesQuery.error}
      emptyTitle="Chưa có lịch dạy."
      emptyDescription="Lịch dạy sẽ hiển thị sau khi bộ môn xếp lịch cho lớp phụ đạo của bạn."
      showLecturer={false}
    />
  )
}
