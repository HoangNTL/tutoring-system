import { KeyRound } from 'lucide-react'

import { formatDate } from '@/shared/lib/date'
import { Button } from '@/shared/ui/button'
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
  onEditPassword: (user: UserListItem) => void
}

export function UsersTable({ users, onEditPassword }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[38%] px-4">Tên đăng nhập</TableHead>
            <TableHead className="w-[24%]">Vai trò</TableHead>
            <TableHead className="w-[26%]">Ngày tạo</TableHead>
            <TableHead className="w-[12%] px-4 text-right">Thao tác</TableHead>
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
                <TableCell className="py-3 text-sm text-slate-600">
                  {formatDate(user.createdAt) || '—'}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  {['LECTURER', 'STUDENT', 'DEPARTMENT'].includes(user.role) ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg px-2.5 text-slate-600 hover:text-[#0f4c81]"
                      onClick={() => onEditPassword(user)}
                    >
                      <KeyRound className="mr-1.5 size-4" />
                      Đổi mật khẩu
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
