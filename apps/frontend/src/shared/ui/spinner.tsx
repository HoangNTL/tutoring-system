import * as React from 'react'
import { Loader2Icon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type SpinnerProps = React.ComponentProps<typeof Loader2Icon> & {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-7',
}

function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', sizeClasses[size], className)}
      {...props}
    />
  )
}

export { Spinner }
