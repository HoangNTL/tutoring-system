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
  type TutorialPeriodStatus,
} from '@/features/tutorial-period/types/tutorialPeriod.types'

type TutorialPeriodFiltersProps = {
  searchInput: string
  statusFilter: TutorialPeriodStatus | 'ALL'
  total?: number
  onSearchChange: (value: string) => void
  onStatusChange: (value: TutorialPeriodStatus | 'ALL') => void
}

export function TutorialPeriodFilters({
  searchInput,
  statusFilter,
  total,
  onSearchChange,
  onStatusChange,
}: TutorialPeriodFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row">
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tiêu đề đợt phụ đạo"
          className="h-10 md:max-w-md"
        />

        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as TutorialPeriodStatus | 'ALL')}
        >
          <SelectTrigger className="h-10 min-w-44">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {tutorialPeriodStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {typeof total === 'number' ? (
        <p className="text-sm text-slate-500">Tổng {total} đợt phụ đạo</p>
      ) : null}
    </div>
  )
}
