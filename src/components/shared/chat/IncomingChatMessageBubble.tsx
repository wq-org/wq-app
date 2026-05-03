import { ChatImageList } from '@/components/shared/chat/ChatImageList'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ChatMessageBubbleProps } from '@/components/shared/chat/types'
import {
  chatBubbleVariants,
  getChatBubbleTailClass,
} from '@/components/shared/chat/chat-bubble-variants'
import { cn } from '@/lib/utils'

export function IncomingChatMessageBubble({
  text,
  time,
  images,
  className,
  avatarUrl,
  avatarFallback = 'U',
  variant = 'default',
  rounded = 'lg',
}: ChatMessageBubbleProps) {
  return (
    <div className={cn('flex max-w-[88%] items-end gap-2', className)}>
      {avatarUrl ? (
        <Avatar
          size="sm"
          className="mb-1 shrink-0 border border-neutral-300/80"
        >
          <AvatarImage
            src={avatarUrl}
            alt="Incoming user avatar"
          />
          <AvatarFallback className="bg-neutral-200 text-[11px] text-neutral-600">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      ) : null}

      <div className="flex min-w-0 max-w-[78%] flex-col items-start">
        <ChatImageList
          images={images}
          className="mb-2"
        />
        <div
          className={cn(
            chatBubbleVariants({ variant, rounded }),
            getChatBubbleTailClass('incoming', rounded),
          )}
        >
          <p>{text}</p>
          <p className="mt-1 text-[10px] opacity-70">{time}</p>
        </div>
      </div>
    </div>
  )
}
