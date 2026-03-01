'use client'

import { useEffect, useRef } from 'react'
import { IncomingChatMessageBubble } from '@/components/shared/chat/IncomingChatMessageBubble'
import { ReceivingChatMessageBubble } from '@/components/shared/chat/ReceivingChatMessageBubble'
import type { ChatHistoryMessage } from '@/components/shared/chat/types'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

type ChatHistoryProps = {
  messages: ChatHistoryMessage[]
  className?: string
  incomingAvatarUrl?: string
  incomingAvatarFallback?: string
  autoScroll?: boolean
}

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-2 shadow-sm">
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
  autoScroll,
}: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = autoScroll !== false

  useEffect(() => {
    if (!shouldAutoScroll) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, shouldAutoScroll])

  return (
    <BlurredScrollArea
      className={cn('flex-1 rounded-[1.25rem] bg-white/40 px-4 sm:px-5', className)}
    >
      <div className="flex flex-col gap-4 pt-5 pb-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.direction === 'receiving' ? 'justify-end' : 'justify-start',
            )}
          >
            {message.direction === 'receiving' ? (
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
            )}
          </div>
        ))}

        <div className="flex justify-start">
          <TypingIndicator />
        </div>

        <div ref={bottomRef} />
      </div>
    </BlurredScrollArea>
  )
}
