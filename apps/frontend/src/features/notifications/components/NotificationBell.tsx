import { useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { useNotifications, useMarkNotificationAsRead } from '../hooks'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'

export default function NotificationBell() {
  const { data: response, isLoading } = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const [isOpen, setIsOpen] = useState(false)

  const notifications = response?.data ?? []
  const unreadCount = notifications.filter((n) => !n.readAt).length

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead.mutateAsync(id)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-slate-100/80 transition-colors"
          aria-label="Thông báo"
        >
          <Bell className="size-5 text-slate-600" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] font-bold text-white border-2 border-white animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 bg-white shadow-xl border border-slate-200/60 rounded-xl overflow-hidden z-[100]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <h3 className="font-semibold text-slate-800 text-sm">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              {unreadCount} mới
            </span>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-slate-500">Đang tải...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <BellOff className="size-8 text-slate-300 mb-2" />
              <p className="text-xs">Không có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const isRead = !!notification.readAt
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, isRead)}
                  className={cn(
                    "p-3.5 transition-all duration-200 cursor-pointer hover:bg-slate-50/70 select-none relative",
                    isRead ? "opacity-55" : "bg-blue-50/20 font-medium"
                  )}
                >
                  {!isRead && (
                    <span className="absolute top-4 left-2.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                  <div className={cn("pl-3.5 space-y-1")}>
                    <p className="text-xs font-semibold text-slate-800">
                      {notification.data.title}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notification.data.message}
                    </p>
                    {notification.data.registrationEndAt && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Hạn đăng ký: {new Date(notification.data.registrationEndAt).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
