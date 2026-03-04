import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble'
import type { ChatMessageBubbleProps } from '@/components/chat/types'

export function ReceivingChatMessageBubble({
  text,
  time,
  images,
  className,
  groupPosition,
}: ChatMessageBubbleProps) {
  return (
    <ChatMessageBubble
      direction="receiving"
      text={text}
      time={time}
      images={images}
      className={className}
      groupPosition={groupPosition}
    />
  )
}
