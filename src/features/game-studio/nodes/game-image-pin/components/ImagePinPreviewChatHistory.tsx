'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { SerializedEditorState } from 'lexical'

import { ReceivingChatMessageBubble } from '@/components/shared/chat'
import type { ChatBubbleVariant } from '@/components/shared/chat'
import { hasLexicalEditorContent } from '@/components/shared/chat'
import { cn } from '@/lib/utils'

import { GameIncomingChatMessageBubble } from '../../../components/GameIncomingChatMessageBubble'
import { GameReceivingChatMessageBubble } from '../../../components/GameReceivingChatMessageBubble'
import { GamePreviewChatHistoryFrame } from '../../../components/GamePreviewChatHistoryFrame'
import type { GameChatHistoryMessage } from '../../../components/game-chat.types'

export type ImagePinPreviewChatHistoryProps = {
  nodeId: string
  descriptionContent?: SerializedEditorState | null
  messages: GameChatHistoryMessage[]
  className?: string
  incomingAvatarUrl?: string
  incomingAvatarFallback?: string
  receivingBubbleVariant?: ChatBubbleVariant
  renderImageChildren?: (message: GameChatHistoryMessage) => ReactNode
  flat?: boolean
}

export function ImagePinPreviewChatHistory({
  nodeId,
  descriptionContent = null,
  messages,
  className,
  incomingAvatarUrl,
  incomingAvatarFallback = '/favicon.ico',
  receivingBubbleVariant = 'orange',
  renderImageChildren,
  flat = false,
}: ImagePinPreviewChatHistoryProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const showLexicalDescription = hasLexicalEditorContent(descriptionContent)
  const hasContent = showLexicalDescription || messages.length > 0
  const shouldAutoScroll = !flat

  useEffect(() => {
    if (!shouldAutoScroll || !listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages.length, shouldAutoScroll, showLexicalDescription])

  return (
    <GamePreviewChatHistoryFrame
      hasContent={hasContent}
      flat={flat}
      autoScroll={shouldAutoScroll}
      hideScrollBar={false}
      reservePreviewHeight={!flat}
      listRef={listRef}
      className={cn('w-full min-w-0', !flat && 'mx-auto max-w-2xl', className)}
      scrollAreaClassName={cn('bg-background', flat ? 'px-2 sm:px-3' : 'px-2 sm:px-3')}
      messageListClassName={flat ? 'gap-2 pb-1 pt-0' : 'gap-3 pb-2 pt-1'}
    >
      {showLexicalDescription && descriptionContent ? (
        <div
          className="flex justify-start"
          data-message-id={`${nodeId}-description`}
        >
          <ReceivingChatMessageBubble
            contentMode="lexical"
            lexicalContent={descriptionContent}
            lexicalHydrationKey={`image-pin-preview-description-${nodeId}`}
            time=""
            avatarUrl={incomingAvatarUrl}
            avatarFallback={incomingAvatarFallback}
            variant="default"
            messageId={`${nodeId}-description`}
          />
        </div>
      ) : null}

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
              layout="play"
              image={message.image}
              imageChildren={renderImageChildren?.(message)}
              avatarUrl="/favicon.ico"
              avatarFallback="/favicon.ico"
              variant={receivingBubbleVariant}
              status={message.status}
              messageId={message.id}
            />
          ) : (
            <GameIncomingChatMessageBubble
              text={message.text}
              time={message.time}
              layout="play"
              image={message.image}
              imageChildren={renderImageChildren?.(message)}
              avatarUrl={incomingAvatarUrl?.trim() || '/favicon.ico'}
              avatarFallback={incomingAvatarFallback}
              variant="default"
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
