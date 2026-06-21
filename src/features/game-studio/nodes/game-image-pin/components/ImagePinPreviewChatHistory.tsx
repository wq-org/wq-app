'use client'

import type { ReactNode } from 'react'
import type { ChatBubbleVariant } from '@/components/shared/chat'

import { GameChatHistory } from '../../../components/GameChatHistory'
import type { GameChatHistoryMessage } from '../../../components/game-chat.types'

export type ImagePinPreviewChatHistoryProps = {
  messages: GameChatHistoryMessage[]
  className?: string
  incomingAvatarUrl?: string
  receivingBubbleVariant?: ChatBubbleVariant
  renderImageChildren?: (message: GameChatHistoryMessage) => ReactNode
  flat?: boolean
}

export function ImagePinPreviewChatHistory({
  messages,
  className,
  incomingAvatarUrl,
  receivingBubbleVariant = 'orange',
  renderImageChildren,
  flat = false,
}: ImagePinPreviewChatHistoryProps) {
  return (
    <GameChatHistory
      messages={messages}
      layout="play"
      flat={flat}
      className={className}
      showUserAvatar
      incomingAvatarUrl={incomingAvatarUrl}
      incomingBubbleVariant="default"
      receivingBubbleVariant={receivingBubbleVariant}
      renderImageChildren={renderImageChildren}
    />
  )
}
