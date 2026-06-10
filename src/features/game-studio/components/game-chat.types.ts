import type { ReactNode } from 'react'
import type {
  ChatBubbleRounded,
  ChatBubbleVariant,
  ChatMessageStatus,
} from '@/components/shared/chat'

/** Natural-pixel rect overlay for image-pin chat images (decoupled from node schema). */
export type GameChatImagePinRect = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export type GameChatImagePinDescriptor = {
  variant: 'image-pin'
  src: string
  alt?: string
  rect?: GameChatImagePinRect
  /** When true, shows the target rectangle overlay (review/editor only). Defaults to false in live play. */
  showTargetRect?: boolean
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
  bold?: boolean
}

export type GameChatBubbleLayout = 'default' | 'play'

export type GameChatMessageBubbleProps = {
  text: string
  time: string
  layout?: GameChatBubbleLayout
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
  textBold?: boolean
}
