import { Link } from 'react-router-dom'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { formatDate } from '@/shared/lib/date'
import type { StudentTutorialPeriod } from '@/features/tutorial-registration/types/studentTutorialPeriod.types'

type StudentTutorialPeriodCardProps = {
  tutorialPeriod: StudentTutorialPeriod
}

export function StudentTutorialPeriodCard({
  tutorialPeriod,
}: StudentTutorialPeriodCardProps) {
  const registrationDeadline = formatDate(tutorialPeriod.registrationEndAt) || '—'

  return (
    <article className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-[#0f4c81]">
            {tutorialPeriod.academicPeriod?.name ?? 'Học kỳ chưa xác định'}
          </p>
          <h3 className="text-lg font-semibold text-slate-950">
            {tutorialPeriod.title}
          </h3>
        </div>

        <Badge
          variant="outline"
          className="w-fit shrink-0 border-sky-200 bg-sky-100 text-sky-700"
        >
          Đang mở đăng ký
        </Badge>
      </div>

      <dl className="mt-3 text-sm text-slate-600">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="font-medium text-slate-700">Hạn đăng ký:</dt>
          <dd>{registrationDeadline}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <Button asChild type="button" variant="outline" className="h-9 rounded-lg px-3">
          <Link to={`/tutorial-registration/${tutorialPeriod.id}`}>Xem thông tin</Link>
        </Button>
      </div>
    </article>
  )
}
