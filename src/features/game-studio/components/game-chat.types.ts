import type {
  ChatBubbleRounded,
  ChatBubbleVariant,
  ChatMessageStatus,
} from '@/components/shared/chat'
import type { GameImagePinRect } from '../nodes/game-image-pin/game-image-pin.schema'

export type GameChatImagePinDescriptor = {
  variant: 'image-pin'
  src: string
  alt?: string
  rect?: GameImagePinRect
}

export type GameChatImageDescriptor = GameChatImagePinDescriptor

export type GameChatHistoryMessage = {
  id: string
  text: string
  time: string
  direction: 'incoming' | 'receiving'
  image?: GameChatImageDescriptor
  status?: ChatMessageStatus
}

export type GameChatMessageBubbleProps = {
  text: string
  time: string
  image?: GameChatImageDescriptor
  className?: string
  avatarUrl?: string
  avatarFallback?: string
  variant?: ChatBubbleVariant
  rounded?: ChatBubbleRounded
  status?: ChatMessageStatus
  messageId?: string
}
