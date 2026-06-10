'use client'

import {
  chatBubbleEnterAnimation,
  chatBubbleVariants,
  getChatBubbleTailClass,
} from '@/components/shared/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DotWaveLoader from '@/components/ui/dot-wave-loader'
import { cn } from '@/lib/utils'
import { GameChatImage } from './GameChatImage'
import type { GameChatMessageBubbleProps } from './game-chat.types'

export function GameIncomingChatMessageBubble({
  text,
  time,
  layout = 'default',
  image,
  imageChildren,
  className,
  avatarUrl,
  avatarFallback = 'U',
  variant = 'default',
  rounded = 'lg',
  status,
  messageId,
  textBold,
}: GameChatMessageBubbleProps) {
  const resolvedStatus = status ?? 'ready'
  const bubbleStateKey =
    messageId != null ? `${messageId}-${resolvedStatus}` : `${text}-${time}-${resolvedStatus}`
  const showImage = Boolean(image) && resolvedStatus !== 'loading'

  const isPlayLayout = layout === 'play'

  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isPlayLayout ? 'w-full max-w-[92%]' : 'max-w-[88%]',
        className,
      )}
    >
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

      <div
        className={cn('flex min-w-0 flex-col items-start', isPlayLayout ? 'w-full' : 'max-w-[78%]')}
      >
        {showImage && image ? (
          <GameChatImage
            {...image}
            className="mb-2"
          >
            {imageChildren}
          </GameChatImage>
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
              <DotWaveLoader variant="orange" />
            </div>
          ) : (
            <>
              <p className={cn('whitespace-pre-line text-inherit', textBold && 'font-bold')}>
                {text}
              </p>
              <p className="mt-1 text-[10px] opacity-70">{time}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
