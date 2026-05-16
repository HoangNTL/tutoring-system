import { Spinner } from '@/shared/ui/spinner'

type ButtonLoaderProps = {
  label: string
}

export default function ButtonLoader({ label }: ButtonLoaderProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner size="sm" className="text-white" />
      {label}
    </span>
  )
}
