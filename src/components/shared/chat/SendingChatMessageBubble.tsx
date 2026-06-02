import { ChatImageList } from '@/components/shared/chat/ChatImageList'
import { ChatBubbleLexicalContent } from '@/components/shared/chat/ChatBubbleLexicalContent'
import {
  chatBubbleEnterAnimation,
  chatBubbleVariants,
  getChatBubbleTailClass,
  resolveDotWaveLoaderVariant,
} from '@/components/shared/chat/chat-bubble-variants'
import {
  isMathChatMessageBubble,
  isLexicalChatMessageBubble,
  type ChatMessageBubbleProps,
} from '@/components/shared/chat/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DotWaveLoader from '@/components/ui/dot-wave-loader'
import { cn } from '@/lib/utils'

export function SendingChatMessageBubble(props: ChatMessageBubbleProps) {
  const {
    time,
    images,
    className,
    avatarUrl,
    avatarFallback = '/favicon.ico',
    hideAvatar = false,
    variant = 'dark',
    rounded = 'lg',
    status,
    messageId,
    textBold,
  } = props

  const isLexical = isLexicalChatMessageBubble(props)
  const isMath = isMathChatMessageBubble(props)
  const text = isLexical || isMath ? '' : props.text
  const lexicalContent = isLexical ? props.lexicalContent : null
  const lexicalHydrationKey = isLexical ? props.lexicalHydrationKey : ''
  const mathContent = isMath ? props.mathContent : null

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
        'flex items-end justify-end gap-2',
        isLexical || isMath ? 'max-w-full w-full' : 'max-w-[88%]',
        className,
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-col items-end',
          isLexical || isMath ? 'w-full max-w-full' : 'max-w-[78%]',
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
            getChatBubbleTailClass('sending', rounded),
            chatBubbleEnterAnimation,
            (isLexical || isMath) && 'w-full max-w-full',
          )}
        >
          {resolvedStatus === 'loading' ? (
            <div className="flex min-h-9 items-center justify-center py-0.5 text-inherit">
              <DotWaveLoader variant={resolveDotWaveLoaderVariant(variant)} />
            </div>
          ) : isMath ? (
            <>
              {mathContent}
              {time ? <p className="mt-1 text-right text-[10px] opacity-70">{time}</p> : null}
            </>
          ) : isLexical ? (
            <>
              <ChatBubbleLexicalContent
                content={lexicalContent}
                hydrationKey={lexicalHydrationKey}
              />
              {time ? <p className="mt-1 text-right text-[10px] opacity-70">{time}</p> : null}
            </>
          ) : (
            <>
              <p className={cn('whitespace-pre-line text-inherit', textBold && 'font-bold')}>
                {text}
              </p>
              {time ? <p className="mt-1 text-right text-[10px] opacity-70">{time}</p> : null}
            </>
          )}
        </div>
      </div>

      {hideAvatar ? (
        <div
          aria-hidden="true"
          className="mb-1 size-7 shrink-0"
        />
      ) : (
        <Avatar
          size="sm"
          className="mb-1 shrink-0 border border-neutral-300/80"
        >
          <AvatarImage
            src={avatarUrl}
            alt="Sent message avatar"
          />
          <AvatarFallback className="bg-neutral-200 text-[11px] text-neutral-600">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
