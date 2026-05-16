import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { vi } from 'date-fns/locale'

import { formatDate, parseDateValue, toDateValue } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'

interface DatePickerFieldProps {
  id?: string
  value?: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
  disabled?: boolean
  className?: string
}

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const selectedDate = parseDateValue(value)
  const displayValue = formatDate(value)

  return (
    <div className="grid gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            size="lg"
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              'h-10 w-full justify-between rounded-xl border-slate-200 bg-white px-3.5 text-left font-medium text-slate-900 shadow-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:border-[#0f4c81] focus-visible:ring-[#0f4c81]/20',
              !displayValue && 'font-normal text-slate-500',
              error &&
                'border-red-300 text-red-600 hover:border-red-300 hover:bg-red-50/40 focus-visible:border-red-300 focus-visible:ring-red-200/70',
              className
            )}
          >
            <span className="truncate pr-3">{displayValue || placeholder}</span>
            <CalendarIcon className="size-4 shrink-0 text-slate-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl" align="start">
          <Calendar
            mode="single"
            locale={vi}
            selected={selectedDate ?? undefined}
            onSelect={(date) => {
              if (!date) {
                return
              }

              onChange(toDateValue(date))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}
