import { ChatHistory } from '@/components/shared/chat/ChatHistory'
import type { ChatHistoryMessage } from '@/components/shared/chat/types'
import type { Message } from '@/lib/chat-data'

interface ChatMessagesProps {
  messages: Message[]
  className?: string
}

export function ChatMessages({ messages, className }: ChatMessagesProps) {
  const historyMessages: ChatHistoryMessage[] = messages.map((message) => ({
    id: message.id,
    text: message.text,
    time: message.time,
    direction: message.isMe ? 'receiving' : 'incoming',
    images: message.images,
  }))

  return (
    <ChatHistory
      messages={historyMessages}
      className={className}
    />
  )
}
