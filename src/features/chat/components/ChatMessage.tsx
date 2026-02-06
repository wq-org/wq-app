import { Badge } from '@/components/ui/badge'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '../types/chat.types'
import { Text } from '@/components/ui/text'

interface ChatMessageProps {
  message: ChatMessageType
  isOwnMessage: boolean
}

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  return (
    <div className={cn('group flex items-start gap-3 mb-4', isOwnMessage && 'flex-row-reverse')}>
      <Text
        as="span"
        variant="small"
        className={cn(
          'text-xs text-muted-foreground shrink-0 w-16',
          isOwnMessage ? 'text-right' : 'text-left',
        )}
      >
        {message.timestamp}
      </Text>
      <div className="flex items-start gap-2 flex-1 max-w-[70%]">
        <div className={cn('flex flex-col gap-1', isOwnMessage && 'items-end')}>
          <Badge
            variant={isOwnMessage ? 'default' : 'secondary'}
            className={cn(
              'w-fit px-4 py-2.5 text-sm font-normal rounded-lg break-words',
              isOwnMessage ? 'bg-black text-white' : 'bg-gray-100 text-gray-900',
            )}
          >
            {message.content}
          </Badge>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="p-1 rounded-full hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Message options"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-40 p-2"
            align={isOwnMessage ? 'end' : 'start'}
          >
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent">
                Copy
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent">
                Delete
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
