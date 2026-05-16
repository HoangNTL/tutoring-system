import { UserRoundX } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

export default function UsersPage() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
          Danh sách
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Quản lý người dùng
        </h1>
      </div>

      <Empty className="min-h-[16rem] rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-10 rounded-xl bg-slate-100 text-slate-600">
            <UserRoundX className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Chưa có người dùng</EmptyTitle>
          <EmptyDescription className="text-sm text-slate-500">
            Danh sách người dùng sẽ hiển thị tại đây.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  )
}
