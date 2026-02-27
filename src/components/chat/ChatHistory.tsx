'use client'

import { useEffect, useRef } from 'react'
import { IncomingChatMessageBubble } from '@/components/chat/IncomingChatMessageBubble'
import { ReceivingChatMessageBubble } from '@/components/chat/ReceivingChatMessageBubble'
import type { ChatHistoryMessage, ChatHistoryTextMessage } from '@/components/chat/types'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import TypingIndicator from '@/components/ui/typing-indicator'
import { cn } from '@/lib/utils'

type ChatHistoryProps = {
  messages: ChatHistoryMessage[]
  className?: string
  incomingAvatarUrl?: string
  incomingAvatarFallback?: string
}

function isTextMessage(message: ChatHistoryMessage): message is ChatHistoryTextMessage {
  return typeof (message as ChatHistoryTextMessage).text === 'string'
}

function resolveCustomComponent(message: ChatHistoryMessage) {
  if (
    'incomingComponent' in message &&
    message.direction === 'incoming' &&
    message.incomingComponent
  ) {
    return message.incomingComponent
  }
  if (
    'receivingComponent' in message &&
    message.direction === 'receiving' &&
    message.receivingComponent
  ) {
    return message.receivingComponent
  }
  if ('component' in message && message.component) {
    return message.component
  }
  return null
}

export function ChatHistory({
  messages,
  className,
  incomingAvatarUrl,
  incomingAvatarFallback,
}: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <BlurredScrollArea
      className={cn('flex-1 rounded-[1.25rem] bg-white/40 px-4 sm:px-5', className)}
    >
      <div className="flex flex-col gap-4 pt-5 pb-6">
        {messages.map((message) => {
          const customComponent = resolveCustomComponent(message)
          const renderedMessage = customComponent ? (
            customComponent
          ) : isTextMessage(message) ? (
            message.direction === 'receiving' ? (
              <ReceivingChatMessageBubble
                text={message.text}
                time={message.time}
                images={message.images}
              />
            ) : (
              <IncomingChatMessageBubble
                text={message.text}
                time={message.time}
                images={message.images}
                avatarUrl={incomingAvatarUrl}
                avatarFallback={incomingAvatarFallback}
              />
            )
          ) : null

          if (!renderedMessage) return null

          return (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.direction === 'receiving' ? 'justify-end' : 'justify-start',
              )}
            >
              {renderedMessage}
            </div>
          )
        })}

        <div className="flex justify-start">
          <TypingIndicator size="sm" />
        </div>

        <div ref={bottomRef} />
      </div>
    </BlurredScrollArea>
  )
}
