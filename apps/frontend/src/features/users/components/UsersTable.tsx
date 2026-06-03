import { formatDate } from '@/shared/lib/date'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  userRoleLabels,
  type UserListItem,
} from '@/features/users/types/user.types'

type UsersTableProps = {
  users: UserListItem[]
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[44%] px-4">Tên đăng nhập</TableHead>
            <TableHead className="w-[26%]">Vai trò</TableHead>
            <TableHead className="w-[30%] px-4">Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            return (
              <TableRow key={user.id}>
                <TableCell className="px-4 py-3 font-medium text-slate-900">
                  {user.username}
                </TableCell>
                <TableCell className="py-3 text-sm text-slate-700">
                  {userRoleLabels[user.role]}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-slate-600">
                  {formatDate(user.createdAt) || '—'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
