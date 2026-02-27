'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { IncomingChatMessageBubble } from '@/components/chat/IncomingChatMessageBubble'
import { ReceivingChatMessageBubble } from '@/components/chat/ReceivingChatMessageBubble'
import type { ChatHistoryMessage, ChatHistoryTextMessage } from '@/components/chat/types'
import { ScrollArea } from '@/components/ui/scroll-area'
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

function TypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-2 shadow-sm',
        className,
      )}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 animate-pulse rounded-full bg-neutral-400"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  )
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

  const renderMessage = (message: ChatHistoryMessage): ReactNode => {
    const customComponent = resolveCustomComponent(message)
    if (customComponent) {
      return customComponent
    }

    if (!isTextMessage(message)) {
      return null
    }

    if (message.direction === 'receiving') {
      return (
        <ReceivingChatMessageBubble
          text={message.text}
          time={message.time}
          images={message.images}
        />
      )
    }

    return (
      <IncomingChatMessageBubble
        text={message.text}
        time={message.time}
        images={message.images}
        avatarUrl={incomingAvatarUrl}
        avatarFallback={incomingAvatarFallback}
      />
    )
  }

  return (
    <ScrollArea
      className={cn(
        'flex-1 rounded-[1.25rem] border border-white/40 bg-white/40 px-4 backdrop-blur-xl sm:px-5',
        className,
      )}
    >
      <div className="flex min-h-full flex-col gap-4 pt-5 pb-6">
        {messages.map((message) => {
          const renderedMessage = renderMessage(message)

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
          <TypingIndicator />
        </div>

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
