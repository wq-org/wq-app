import { ChatHistory } from '@/components/shared/chat/ChatHistory'
import type {
  ChatBubbleRounded,
  ChatBubbleVariant,
} from '@/components/shared/chat/chat-bubble-variants'
import type { ChatHistoryMessage } from '@/components/shared/chat/types'
import type { Message } from '@/lib/chat-data'

interface ChatMessagesProps {
  messages: Message[]
  className?: string
  incomingAvatarUrl?: string
  incomingAvatarFallback?: string
  incomingBubbleVariant?: ChatBubbleVariant
  receivingBubbleVariant?: ChatBubbleVariant
  incomingBubbleRounded?: ChatBubbleRounded
  receivingBubbleRounded?: ChatBubbleRounded
}

export function ChatMessages({
  messages,
  className,
  incomingAvatarUrl,
  incomingAvatarFallback,
  incomingBubbleVariant,
  receivingBubbleVariant,
  incomingBubbleRounded,
  receivingBubbleRounded,
}: ChatMessagesProps) {
  const historyMessages: ChatHistoryMessage[] = messages.map((message) => ({
    id: message.id,
    text: message.text,
    time: message.time,
    direction: message.isMe ? 'receiving' : 'incoming',
    images: message.images,
    status: message.status,
  }))

  return (
    <ChatHistory
      messages={historyMessages}
      className={className}
      incomingAvatarUrl={incomingAvatarUrl}
      incomingAvatarFallback={incomingAvatarFallback}
      incomingBubbleVariant={incomingBubbleVariant}
      receivingBubbleVariant={receivingBubbleVariant}
      incomingBubbleRounded={incomingBubbleRounded}
      receivingBubbleRounded={receivingBubbleRounded}
    />
  )
}
