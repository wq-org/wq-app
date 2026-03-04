import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble'
import type { ChatMessageBubbleProps } from '@/components/chat/types'

export function IncomingChatMessageBubble({
  text,
  time,
  images,
  className,
  avatarUrl,
  avatarFallback = 'U',
  groupPosition,
}: ChatMessageBubbleProps) {
  return (
    <ChatMessageBubble
      direction="incoming"
      text={text}
      time={time}
      images={images}
      className={className}
      avatarUrl={avatarUrl}
      avatarFallback={avatarFallback}
      groupPosition={groupPosition}
    />
  )
}
