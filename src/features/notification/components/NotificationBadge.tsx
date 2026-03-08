import { Bell, BellDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationPanel } from './NotificationPanel'

interface NotificationBadgeProps {
  count?: number
}

export function NotificationBadge({ count = 0 }: NotificationBadgeProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          {count > 0 ? <BellDot className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          {count > 0 && (
            <Badge className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums bg-[#FF015B] text-white hover:bg-[#FF015B]">
              {count > 99 ? '99+' : count}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[600px] p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <NotificationPanel />
      </PopoverContent>
    </Popover>
  )
}
