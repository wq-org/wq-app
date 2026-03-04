import type { ReactNode } from 'react'

export type ChatHistoryMessageDirection = 'incoming' | 'receiving'

export type ChatImageItem =
  | string
  | {
      src: string
      alt?: string
      ratio?: number
    }

type ChatHistoryMessageBase = {
  id: string
  direction: ChatHistoryMessageDirection
  images?: ChatImageItem[]
}

export type ChatHistoryTextMessage = ChatHistoryMessageBase & {
  text: string
  time: string
  component?: never
  incomingComponent?: never
  receivingComponent?: never
}

export type ChatHistoryComponentMessage = ChatHistoryMessageBase & {
  component?: ReactNode
  incomingComponent?: ReactNode
  receivingComponent?: ReactNode
  text?: never
  time?: never
}

export type ChatHistoryMessage = ChatHistoryTextMessage | ChatHistoryComponentMessage

export type ChatBubbleGroupPosition = 'single' | 'first' | 'middle' | 'last'

export type ChatMessageBubbleProps = {
  text: string
  time: string
  images?: ChatImageItem[]
  className?: string
  avatarUrl?: string
  avatarFallback?: string
  groupPosition?: ChatBubbleGroupPosition
}
