import type { ChatBubbleRounded, ChatBubbleVariant } from './chat-bubble-variants'

export type ChatMessageStatus = 'loading' | 'ready'

export type ChatHistoryMessageDirection = 'incoming' | 'receiving'

export type ChatImageItem =
  | string
  | {
      src: string
      alt?: string
      ratio?: number
    }

export type ChatHistoryMessage = {
  id: string
  text: string
  time: string
  direction: ChatHistoryMessageDirection
  images?: ChatImageItem[]
  /** When `loading`, the bubble shows `DotWaveLoader` until you set `ready` (or omit for ready). */
  status?: ChatMessageStatus
}

export type ChatMessageBubbleProps = {
  text: string
  time: string
  images?: ChatImageItem[]
  className?: string
  avatarUrl?: string
  avatarFallback?: string
  variant?: ChatBubbleVariant
  rounded?: ChatBubbleRounded
  status?: ChatMessageStatus
  /** Stable id (e.g. `ChatHistory` message id) for enter animation when status or content appears. */
  messageId?: string
}
