import { ChatImageList } from '@/components/shared/chat/ChatImageList'
import {
  chatBubbleEnterAnimation,
  chatBubbleVariants,
  getChatBubbleTailClass,
} from '@/components/shared/chat/chat-bubble-variants'
import type { ChatMessageBubbleProps } from '@/components/shared/chat/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DotWaveLoader from '@/components/ui/dot-wave-loader'
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
  status,
  messageId,
}: ChatMessageBubbleProps) {
  const resolvedStatus = status ?? 'ready'
  const bubbleStateKey =
    messageId != null ? `${messageId}-${resolvedStatus}` : `${text}-${time}-${resolvedStatus}`
  const showImages = Boolean(images?.length) && resolvedStatus !== 'loading'

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
            getChatBubbleTailClass('incoming', rounded),
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
              <p className="mt-1 text-[10px] opacity-70">{time}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
