import { ChatImageList } from '@/components/shared/chat/ChatImageList'
import {
  chatBubbleEnterAnimation,
  chatBubbleVariants,
  getChatBubbleTailClass,
} from '@/components/shared/chat/chat-bubble-variants'
import type { ChatMessageBubbleProps } from '@/components/shared/chat/types'
import DotWaveLoader from '@/components/ui/dot-wave-loader'
import { cn } from '@/lib/utils'

export function ReceivingChatMessageBubble({
  text,
  time,
  images,
  className,
  variant = 'dark',
  rounded = 'lg',
  status,
  messageId,
}: ChatMessageBubbleProps) {
  const resolvedStatus = status ?? 'ready'
  const bubbleStateKey =
    messageId != null ? `${messageId}-${resolvedStatus}` : `${text}-${time}-${resolvedStatus}`
  const showImages = Boolean(images?.length) && resolvedStatus !== 'loading'

  return (
    <div className={cn('flex max-w-[78%] flex-col items-end', className)}>
      {showImages ? (
        <ChatImageList
          images={images}
          className="mb-2"
        />
      ) : null}
      <div
        key={bubbleStateKey}
        className={cn(
          chatBubbleVariants({ variant, rounded }),
          getChatBubbleTailClass('receiving', rounded),
          chatBubbleEnterAnimation,
        )}
      >
        {resolvedStatus === 'loading' ? (
          <div className="flex min-h-9 items-center justify-center py-0.5">
            <DotWaveLoader variant="default" />
          </div>
        ) : (
          <>
            <p>{text}</p>
            <p className="mt-1 text-right text-[10px] opacity-70">{time}</p>
          </>
        )}
      </div>
    </div>
  )
}
