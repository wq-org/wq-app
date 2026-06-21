'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { ChatBubbleRounded, ChatBubbleVariant } from '@/components/shared/chat'
import { cn } from '@/lib/utils'
import { GameIncomingChatMessageBubble } from './GameIncomingChatMessageBubble'
import { GameReceivingChatMessageBubble } from './GameReceivingChatMessageBubble'
import { GamePreviewChatHistoryFrame } from './GamePreviewChatHistoryFrame'
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
  /** Scrolls the message with this id into view when it changes (e.g. analytics node jump). */
  scrollToMessageId?: string
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
  scrollToMessageId,
}: GameChatHistoryProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = !flat && autoScroll !== false

  useEffect(() => {
    if (!scrollToMessageId) return
    const target = listRef.current?.querySelector(`[data-message-id="${scrollToMessageId}"]`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [scrollToMessageId])

  const isPlayLayout = layout === 'play'
  const messageListClassName = isPlayLayout
    ? flat
      ? 'gap-2 pb-1 pt-0'
      : 'gap-3 pb-2 pt-1'
    : flat
      ? 'gap-3 py-1'
      : 'gap-4 pb-6 pt-5'

  return (
    <GamePreviewChatHistoryFrame
      hasContent={messages.length > 0}
      flat={flat}
      autoScroll={shouldAutoScroll}
      hideScrollBar={false}
      reservePreviewHeight={isPlayLayout && !flat}
      listRef={listRef}
      className={cn('w-full min-w-0', isPlayLayout && !flat && 'mx-auto max-w-2xl', className)}
      scrollAreaClassName={cn('bg-background', isPlayLayout ? 'px-2 sm:px-3' : 'px-4 sm:px-5')}
      messageListClassName={messageListClassName}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          data-message-id={message.id}
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
    </GamePreviewChatHistoryFrame>
  )
}
