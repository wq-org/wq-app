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
}

export type ChatMessageBubbleProps = {
  text: string
  time: string
  images?: ChatImageItem[]
  className?: string
  avatarUrl?: string
  avatarFallback?: string
}
