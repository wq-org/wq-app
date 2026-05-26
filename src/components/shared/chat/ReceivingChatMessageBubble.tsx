import { ChatImageList } from '@/components/shared/chat/ChatImageList'
import { ChatBubbleLexicalContent } from '@/components/shared/chat/ChatBubbleLexicalContent'
import {
  chatBubbleEnterAnimation,
  chatBubbleVariants,
  getChatBubbleTailClass,
} from '@/components/shared/chat/chat-bubble-variants'
import {
  isLexicalChatMessageBubble,
  type ChatMessageBubbleProps,
} from '@/components/shared/chat/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DotWaveLoader from '@/components/ui/dot-wave-loader'
import { cn } from '@/lib/utils'

export function ReceivingChatMessageBubble(props: ChatMessageBubbleProps) {
  const {
    time,
    images,
    className,
    avatarUrl,
    avatarFallback = 'U',
    hideAvatar = false,
    variant = 'default',
    rounded = 'lg',
    status,
    messageId,
  } = props

  const isLexical = isLexicalChatMessageBubble(props)
  const text = isLexical ? '' : props.text
  const lexicalContent = isLexical ? props.lexicalContent : null
  const lexicalHydrationKey = isLexical ? props.lexicalHydrationKey : ''

  const resolvedStatus = status ?? 'ready'
  const bubbleStateKey = isLexical
    ? `${lexicalHydrationKey}-${resolvedStatus}`
    : messageId != null
      ? `${messageId}-${resolvedStatus}`
      : `${text}-${time}-${resolvedStatus}`
  const showImages = Boolean(images?.length) && resolvedStatus !== 'loading'

  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isLexical ? 'max-w-full w-full' : 'max-w-[88%]',
        className,
      )}
    >
      {hideAvatar ? (
        <div
          aria-hidden="true"
          className="mb-1 size-7 shrink-0"
        />
      ) : (
        <Avatar
          size="sm"
          className="mb-1 shrink-0"
        >
          <AvatarImage
            src={avatarUrl}
            alt="Received message avatar"
          />
          <AvatarFallback className="bg-neutral-200 text-[11px] text-neutral-600">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex min-w-0 flex-col items-start',
          isLexical ? 'w-full max-w-full' : 'max-w-[78%]',
        )}
      >
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
            isLexical && 'w-full max-w-full',
          )}
        >
          {resolvedStatus === 'loading' ? (
            <div className="flex min-h-9 items-center justify-center py-0.5">
              <DotWaveLoader variant="default" />
            </div>
          ) : isLexical ? (
            <>
              <ChatBubbleLexicalContent
                content={lexicalContent}
                hydrationKey={lexicalHydrationKey}
              />
              {time ? <p className="mt-1 text-[10px] opacity-70">{time}</p> : null}
            </>
          ) : (
            <>
              <p>{text}</p>
              {time ? <p className="mt-1 text-[10px] opacity-70">{time}</p> : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
