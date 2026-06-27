import type { ReactNode } from 'react'
import type { SerializedEditorState } from 'lexical'

import type { ChatBubbleRounded, ChatBubbleVariant } from './chat-bubble-variants'

export type ChatMessageStatus = 'loading' | 'ready'

/** Legacy messaging sidebar contact row (demo / test UI only). */
export type Contact = {
  id: string
  name: string
  initials: string
  online: boolean
  time: string
  lastMessage: string
  unread: number
}

/** Legacy messaging thread message (demo / test UI only). */
export type Message = {
  id: string
  text: string
  time: string
  isMe: boolean
  images?: string[]
  status?: ChatMessageStatus
}

export type ChatHistoryMessageDirection = 'receiving' | 'sending'

export type ChatMessageContentMode = 'text' | 'lexical'

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

type ChatMessageBubbleBaseProps = {
  time: string
  images?: ChatImageItem[]
  className?: string
  avatarUrl?: string
  avatarFallback?: string
  /** Suppress the avatar and render a same-width spacer instead. Use for consecutive messages from the same user. */
  hideAvatar?: boolean
  variant?: ChatBubbleVariant
  rounded?: ChatBubbleRounded
  status?: ChatMessageStatus
  /** Stable id (e.g. `ChatHistory` message id) for enter animation when status or content appears. */
  messageId?: string
  /** Renders bubble body text in bold (e.g. score feedback). */
  textBold?: boolean
}

export type ChatMessageBubbleTextProps = ChatMessageBubbleBaseProps & {
  contentMode?: 'text'
  text: string
}

export type ChatMessageBubbleLexicalProps = ChatMessageBubbleBaseProps & {
  contentMode: 'lexical'
  lexicalContent: SerializedEditorState | null | undefined
  /** Stable key for Lexical hydration — required when `contentMode` is `lexical`. */
  lexicalHydrationKey: string
}

export type ChatMessageBubbleMathProps = ChatMessageBubbleBaseProps & {
  contentMode: 'math'
  mathContent: ReactNode
}

export type ChatMessageBubbleProps =
  | ChatMessageBubbleTextProps
  | ChatMessageBubbleLexicalProps
  | ChatMessageBubbleMathProps

export function isLexicalChatMessageBubble(
  props: ChatMessageBubbleProps,
): props is ChatMessageBubbleLexicalProps {
  return props.contentMode === 'lexical'
}

export function isMathChatMessageBubble(
  props: ChatMessageBubbleProps,
): props is ChatMessageBubbleMathProps {
  return props.contentMode === 'math'
}
