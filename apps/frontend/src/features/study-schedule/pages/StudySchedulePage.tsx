import { UserScheduleViewer } from '@/features/schedule-view/components/UserScheduleViewer'
import { useStudentSchedules } from '@/features/schedule-view/hooks'

export default function StudySchedulePage() {
  const schedulesQuery = useStudentSchedules()

  return (
    <UserScheduleViewer
      title="Lịch học"
      description="Theo dõi lịch học theo tuần đã chọn từ các khung giờ hằng tuần mà bộ môn đã thiết lập cho lớp phụ đạo của bạn."
      items={schedulesQuery.data?.data ?? []}
      isLoading={schedulesQuery.isPending && !schedulesQuery.data}
      isError={schedulesQuery.isError}
      error={schedulesQuery.error}
      emptyTitle="Chưa có lịch học."
      emptyDescription="Lịch học sẽ hiển thị sau khi lớp phụ đạo của bạn được xếp lịch."
      showLecturer
    />
  )
}
