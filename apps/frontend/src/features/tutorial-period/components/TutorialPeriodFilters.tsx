import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  tutorialPeriodStatusLabels,
  type TutorialPeriodStatus,
} from '@/features/tutorial-period/types/tutorialPeriod.types'

type TutorialPeriodFiltersProps = {
  searchInput: string
  statusFilter: TutorialPeriodStatus | 'ALL' | 'ACTIVE' | 'ARCHIVED'
  activeTab: 'ACTIVE' | 'ARCHIVED'
  onSearchChange: (value: string) => void
  onStatusChange: (value: any) => void
}

export function TutorialPeriodFilters({
  searchInput,
  statusFilter,
  activeTab,
  onSearchChange,
  onStatusChange,
}: TutorialPeriodFiltersProps) {
  const statuses = activeTab === 'ACTIVE'
    ? (['DRAFT', 'OPEN', 'ASSIGNING', 'ONGOING'] as const)
    : (['CLOSED', 'CANCELLED'] as const)

  const allOptionLabel = activeTab === 'ACTIVE'
    ? 'Tất cả đợt đang hoạt động'
    : 'Tất cả đợt lưu trữ'

  const allOptionValue = activeTab === 'ACTIVE' ? 'ACTIVE' : 'ARCHIVED'

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center">
      <Input
        value={searchInput}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm theo tiêu đề đợt phụ đạo"
        className="h-9 md:max-w-[440px] lg:flex-1"
      />

      <Select
        value={statusFilter}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="h-9 min-w-40 md:w-56">
          <SelectValue placeholder="Lọc trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={allOptionValue}>{allOptionLabel}</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {tutorialPeriodStatusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
