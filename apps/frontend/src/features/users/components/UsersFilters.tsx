import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  userRoleLabels,
  userRoles,
  type UserRole,
} from '@/features/users/types/user.types'

type UsersFiltersProps = {
  searchInput: string
  roleFilter: UserRole | 'ALL'
  onSearchChange: (value: string) => void
  onRoleChange: (value: UserRole | 'ALL') => void
}

export function UsersFilters({
  searchInput,
  roleFilter,
  onSearchChange,
  onRoleChange,
}: UsersFiltersProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center">
      <Input
        value={searchInput}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm theo tên đăng nhập"
        className="h-9 md:max-w-[440px] lg:flex-1"
      />

      <Select value={roleFilter} onValueChange={(value) => onRoleChange(value as UserRole | 'ALL')}>
        <SelectTrigger className="h-9 min-w-40 md:w-44">
          <SelectValue placeholder="Lọc vai trò" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả vai trò</SelectItem>
          {userRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {userRoleLabels[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
