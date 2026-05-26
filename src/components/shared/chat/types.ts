import type { SerializedEditorState } from 'lexical'

import type { ChatBubbleRounded, ChatBubbleVariant } from './chat-bubble-variants'

export type ChatMessageStatus = 'loading' | 'ready'

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

export type ChatMessageBubbleProps = ChatMessageBubbleTextProps | ChatMessageBubbleLexicalProps

export function isLexicalChatMessageBubble(
  props: ChatMessageBubbleProps,
): props is ChatMessageBubbleLexicalProps {
  return props.contentMode === 'lexical'
}
