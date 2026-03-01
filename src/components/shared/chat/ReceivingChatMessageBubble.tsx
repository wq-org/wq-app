import { ChatImageList } from '@/components/chat/ChatImageList'
import type { ChatMessageBubbleProps } from '@/components/chat/types'
import { cn } from '@/lib/utils'

export function ReceivingChatMessageBubble({
  text,
  time,
  images,
  className,
}: ChatMessageBubbleProps) {
  return (
    <div className={cn('flex max-w-[78%] flex-col items-end', className)}>
      <ChatImageList
        images={images}
        className="mb-2"
      />
      <div className="rounded-[1.25rem] rounded-br-md bg-neutral-900 px-4 py-2.5 text-neutral-50 shadow-sm">
        <p className="text-sm leading-relaxed">{text}</p>
        <p className="mt-1 text-right text-[10px] text-neutral-300">{time}</p>
      </div>
    </div>
  )
}
