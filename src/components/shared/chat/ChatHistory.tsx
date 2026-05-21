'use client'

import { useEffect, useRef } from 'react'
import { ReceivingChatMessageBubble } from '@/components/shared/chat/ReceivingChatMessageBubble'
import { SendingChatMessageBubble } from '@/components/shared/chat/SendingChatMessageBubble'
import type {
  ChatBubbleRounded,
  ChatBubbleVariant,
} from '@/components/shared/chat/chat-bubble-variants'
import type { ChatHistoryMessage } from '@/components/shared/chat/types'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

type ChatHistoryProps = {
  messages: ChatHistoryMessage[]
  className?: string
  showUserAvatar?: boolean
  incomingAvatarUrl?: string
  incomingAvatarFallback?: string
  autoScroll?: boolean
  incomingBubbleVariant?: ChatBubbleVariant
  receivingBubbleVariant?: ChatBubbleVariant
  incomingBubbleRounded?: ChatBubbleRounded
  receivingBubbleRounded?: ChatBubbleRounded
}

export function ChatHistory({
  messages,
  className,
  showUserAvatar = false,
  incomingAvatarUrl,
  incomingAvatarFallback = '/favicon.ico',
  autoScroll,
  incomingBubbleVariant,
  receivingBubbleVariant,
  incomingBubbleRounded,
  receivingBubbleRounded,
}: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = autoScroll !== false

  useEffect(() => {
    if (!shouldAutoScroll) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, shouldAutoScroll])

  return (
    <div
      className={cn(
        'flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-[1.25rem]',
        className,
      )}
    >
      <BlurredScrollArea
        className="flex h-full min-h-0 flex-1 flex-col bg-background px-4 sm:px-5"
        viewportClassName="min-h-0 max-h-full flex-1 basis-0 [&>div]:!block [&>div]:min-h-0"
      >
        <div className="flex flex-col gap-4 pb-6 pt-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.direction === 'sending' ? 'justify-end' : 'justify-start',
              )}
            >
              {message.direction === 'sending' ? (
                <SendingChatMessageBubble
                  text={message.text}
                  time={message.time}
                  images={message.images}
                  avatarUrl={showUserAvatar ? '/favicon.ico' : undefined}
                  avatarFallback="/favicon.ico"
                  variant={receivingBubbleVariant}
                  rounded={receivingBubbleRounded}
                  status={message.status}
                  messageId={message.id}
                />
              ) : (
                <ReceivingChatMessageBubble
                  text={message.text}
                  time={message.time}
                  images={message.images}
                  avatarUrl={
                    showUserAvatar ? incomingAvatarUrl?.trim() || '/favicon.ico' : incomingAvatarUrl
                  }
                  avatarFallback={incomingAvatarFallback}
                  variant={incomingBubbleVariant}
                  rounded={incomingBubbleRounded}
                  status={message.status}
                  messageId={message.id}
                />
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </BlurredScrollArea>
    </div>
  )
}
