import { FileChartColumn } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

export default function ReportsPage() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
          Tổng hợp
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Báo cáo & thống kê
        </h1>
      </div>

      <Empty className="min-h-[16rem] rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-10 rounded-xl bg-slate-100 text-slate-600">
            <FileChartColumn className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Chưa có báo cáo</EmptyTitle>
          <EmptyDescription className="text-sm text-slate-500">
            Dữ liệu báo cáo sẽ xuất hiện khi hệ thống sẵn sàng.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  )
}
