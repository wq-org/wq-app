'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { ChatBubbleRounded, ChatBubbleVariant } from '@/components/shared/chat'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'
import { GameIncomingChatMessageBubble } from './GameIncomingChatMessageBubble'
import { GameReceivingChatMessageBubble } from './GameReceivingChatMessageBubble'
import type { GameChatBubbleLayout, GameChatHistoryMessage } from './game-chat.types'

type GameChatHistoryProps = {
  messages: GameChatHistoryMessage[]
  /** Play/review sessions use a centered column and tighter spacing. */
  layout?: GameChatBubbleLayout
  className?: string
  showUserAvatar?: boolean
  incomingAvatarUrl?: string
  incomingAvatarFallback?: string
  autoScroll?: boolean
  incomingBubbleVariant?: ChatBubbleVariant
  receivingBubbleVariant?: ChatBubbleVariant
  incomingBubbleRounded?: ChatBubbleRounded
  receivingBubbleRounded?: ChatBubbleRounded
  /** Overlay rendered inside the message's image container (e.g. a dropped pin on the active question). */
  renderImageChildren?: (message: GameChatHistoryMessage) => ReactNode
  /** When true, render messages only (parent owns scroll, e.g. If/Else continuous session). */
  flat?: boolean
}

export function GameChatHistory({
  messages,
  layout = 'default',
  className,
  showUserAvatar = false,
  incomingAvatarUrl,
  incomingAvatarFallback = '/favicon.ico',
  autoScroll,
  incomingBubbleVariant,
  receivingBubbleVariant,
  incomingBubbleRounded,
  receivingBubbleRounded,
  renderImageChildren,
  flat = false,
}: GameChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = !flat && autoScroll !== false

  useEffect(() => {
    if (!shouldAutoScroll) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, shouldAutoScroll])

  const isPlayLayout = layout === 'play'

  const messageList = (
    <div
      className={cn(
        'flex flex-col',
        isPlayLayout ? 'gap-3 pb-2 pt-1' : flat ? 'gap-3 py-1' : 'gap-4 pb-6 pt-5',
      )}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex',
            message.direction === 'receiving' ? 'justify-end' : 'justify-start',
          )}
        >
          {message.direction === 'receiving' ? (
            <GameReceivingChatMessageBubble
              text={message.text}
              time={message.time}
              layout={layout}
              image={message.image}
              imageChildren={renderImageChildren?.(message)}
              avatarUrl={showUserAvatar ? '/favicon.ico' : undefined}
              avatarFallback="/favicon.ico"
              variant={receivingBubbleVariant}
              rounded={receivingBubbleRounded}
              status={message.status}
              messageId={message.id}
            />
          ) : (
            <GameIncomingChatMessageBubble
              text={message.text}
              time={message.time}
              layout={layout}
              image={message.image}
              imageChildren={renderImageChildren?.(message)}
              avatarUrl={
                showUserAvatar ? incomingAvatarUrl?.trim() || '/favicon.ico' : incomingAvatarUrl
              }
              avatarFallback={incomingAvatarFallback}
              variant={incomingBubbleVariant}
              rounded={incomingBubbleRounded}
              status={message.status}
              messageId={message.id}
              textBold={message.bold}
            />
          )}
        </div>
      ))}

      {shouldAutoScroll ? <div ref={bottomRef} /> : null}
    </div>
  )

  const columnClassName = cn(
    'w-full min-w-0',
    isPlayLayout && !flat && 'mx-auto max-w-2xl',
    className,
  )

  if (flat) {
    return <div className={columnClassName}>{messageList}</div>
  }

  return (
    <div
      className={cn(
        'flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-[1.25rem]',
        isPlayLayout && !flat && 'mx-auto max-w-2xl',
        className,
      )}
    >
      <BlurredScrollArea
        className={cn(
          'flex h-full min-h-0 flex-1 flex-col bg-background',
          isPlayLayout ? 'px-2 sm:px-3' : 'px-4 sm:px-5',
        )}
        viewportClassName="min-h-0 max-h-full flex-1 basis-0 [&>div]:!block [&>div]:min-h-0"
      >
        {messageList}
      </BlurredScrollArea>
    </div>
  )
}
