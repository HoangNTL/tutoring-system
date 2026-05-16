import { cn } from '@/shared/lib/utils'
import { Spinner } from '@/shared/ui/spinner'

type PageLoaderProps = {
  label?: string
  fullScreen?: boolean
  className?: string
}

export default function PageLoader({
  label = 'Đang tải...',
  fullScreen = true,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-white/80 text-slate-600',
        fullScreen ? 'min-h-screen' : 'min-h-[40vh]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Spinner size="lg" className="text-[#0f4c81]" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}
