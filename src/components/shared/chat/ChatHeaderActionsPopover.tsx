import { EllipsisVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type ChatHeaderActionsPopoverProps = {
  className?: string
}

const ACTION_ITEMS = ['View profile', 'Mute notifications', 'Archive chat']

export function ChatHeaderActionsPopover({ className }: ChatHeaderActionsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={
            className ??
            'h-9 w-9 rounded-full border border-neutral-200 bg-white/80 hover:bg-accent'
          }
          aria-label="Chat options"
        >
          <EllipsisVertical className="h-4 w-4 text-neutral-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="mt-3 w-48 rounded-2xl border border-neutral-200 bg-white/95 p-2 backdrop-blur-xl"
      >
        <div className="space-y-1">
          {ACTION_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              {item}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
