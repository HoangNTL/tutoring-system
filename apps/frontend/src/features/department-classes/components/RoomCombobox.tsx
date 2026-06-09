import { useEffect, useMemo, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import type { DepartmentRoomOption } from '@/features/department-classes/types/departmentTutorialClass.types'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'

type RoomComboboxProps = {
  rooms: DepartmentRoomOption[]
  value: string
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
  onValueChange: (value: string) => void
}

function formatRoomLabel(room: DepartmentRoomOption) {
  const baseLabel =
    room.code?.trim() || room.name?.trim() || `Phòng ${room.id}`

  return room.capacity ? `${baseLabel} · ${room.capacity} chỗ` : baseLabel
}

export function RoomCombobox({
  rooms,
  value,
  disabled = false,
  isLoading = false,
  placeholder = 'Chọn phòng học',
  onValueChange,
}: RoomComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === value) ?? null,
    [rooms, value]
  )

  const filteredRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return rooms
    }

    return rooms.filter((room) =>
      `${room.code ?? ''} ${room.name ?? ''} ${room.capacity ?? ''}`
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [rooms, search])

  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-10 w-full justify-between px-3 font-normal"
        >
          <span className="truncate text-left">
            {selectedRoom ? formatRoomLabel(selectedRoom) : placeholder}
          </span>
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="border-b border-slate-200 p-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo mã hoặc tên phòng"
            disabled={disabled || isLoading}
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {isLoading ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              Đang tải phòng học...
            </p>
          ) : filteredRooms.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              Không có phòng học.
            </p>
          ) : (
            filteredRooms.map((room) => {
              const isSelected = String(room.id) === value

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    onValueChange(String(room.id))
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none',
                    isSelected && 'bg-accent text-accent-foreground'
                  )}
                >
                  <span className="truncate">{formatRoomLabel(room)}</span>
                  {isSelected ? <CheckIcon className="ml-2 size-4 shrink-0" /> : null}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
