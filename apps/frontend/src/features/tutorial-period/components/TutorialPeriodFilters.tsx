import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  tutorialPeriodStatuses,
  tutorialPeriodStatusLabels,
  type TutorialPeriodStatus,
} from '@/features/tutorial-period/types/tutorialPeriod.types'

type TutorialPeriodFiltersProps = {
  searchInput: string
  statusFilter: TutorialPeriodStatus | 'ALL'
  onSearchChange: (value: string) => void
  onStatusChange: (value: TutorialPeriodStatus | 'ALL') => void
}

export function TutorialPeriodFilters({
  searchInput,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: TutorialPeriodFiltersProps) {
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
        onValueChange={(value) => onStatusChange(value as TutorialPeriodStatus | 'ALL')}
      >
        <SelectTrigger className="h-9 min-w-40 md:w-44">
          <SelectValue placeholder="Lọc trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
          {tutorialPeriodStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {tutorialPeriodStatusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
