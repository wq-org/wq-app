import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationPanel } from './NotificationPanel'

export function NotificationBadge() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <Bell className="h-5 w-5" />
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
