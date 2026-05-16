import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

type ErrorStateProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function ErrorState({
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center',
        className
      )}
    >
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-sm font-medium text-red-700">{title}</h3>
        {description ? (
          <p className="text-xs text-red-600/90">{description}</p>
        ) : null}
      </div>

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
