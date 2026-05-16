import type { ReactNode } from 'react'
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
  /** When set, the image becomes a dnd-kit drop target with this id. Requires an enclosing DndContext. */
  droppableId?: string
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
  /** Optional overlay rendered inside the image container (e.g. a draggable pin placed by the player). */
  imageChildren?: ReactNode
  className?: string
  avatarUrl?: string
  avatarFallback?: string
  variant?: ChatBubbleVariant
  rounded?: ChatBubbleRounded
  status?: ChatMessageStatus
  messageId?: string
}
