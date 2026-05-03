import { ChatImageList } from '@/components/shared/chat/ChatImageList'
import type { ChatMessageBubbleProps } from '@/components/shared/chat/types'
import {
  chatBubbleVariants,
  getChatBubbleTailClass,
} from '@/components/shared/chat/chat-bubble-variants'
import { cn } from '@/lib/utils'

export function ReceivingChatMessageBubble({
  text,
  time,
  images,
  className,
  variant = 'dark',
  rounded = 'lg',
}: ChatMessageBubbleProps) {
  return (
    <div className={cn('flex max-w-[78%] flex-col items-end', className)}>
      <ChatImageList
        images={images}
        className="mb-2"
      />
      <div
        className={cn(
          chatBubbleVariants({ variant, rounded }),
          getChatBubbleTailClass('receiving', rounded),
        )}
      >
        <p>{text}</p>
        <p className="mt-1 text-right text-[10px] opacity-70">{time}</p>
      </div>
    </div>
  )
}
