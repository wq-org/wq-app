import { Bell, BellDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import NotificationPanel from './NotificationPanel'

interface NotificationBadgeProps {
  count?: number
}

export default function NotificationBadge({ count = 0 }: NotificationBadgeProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          {count > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
              >
                {count > 9 ? '9+' : count}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
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
