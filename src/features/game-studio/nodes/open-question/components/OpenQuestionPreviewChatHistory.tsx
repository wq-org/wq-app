'use client'

import { useMemo } from 'react'

import { ChatHistory } from '@/components/shared/chat'
import type { ChatHistoryMessage } from '@/components/shared/chat/types'
import type { ChatBubbleVariant } from '@/components/shared/chat/chat-bubble-variants'

export type OpenQuestionPreviewChatMessage = {
  id: string
  direction: 'sending' | 'receiving'
  text: string
  status?: 'loading' | 'ready'
  textBold?: boolean
}

export type OpenQuestionPreviewChatHistoryProps = {
  nodeId: string
  title: string
  showTitle: boolean
  previewMessages?: readonly OpenQuestionPreviewChatMessage[]
  incomingAvatarUrl?: string
  incomingAvatarFallback: string
  incomingBubbleVariant?: ChatBubbleVariant
  receivingBubbleVariant?: ChatBubbleVariant
  className?: string
}

function buildSeedMessages({
  nodeId,
  title,
  showTitle,
}: Pick<
  OpenQuestionPreviewChatHistoryProps,
  'nodeId' | 'title' | 'showTitle'
>): ChatHistoryMessage[] {
  if (!showTitle) return []

  return [
    {
      id: `${nodeId}-title`,
      text: title,
      time: '',
      direction: 'receiving',
    },
  ]
}

function toChatHistoryMessage(message: OpenQuestionPreviewChatMessage): ChatHistoryMessage {
  return {
    id: message.id,
    text: message.text,
    time: '',
    direction: message.direction,
    status: message.status,
  }
}

export function OpenQuestionPreviewChatHistory({
  nodeId,
  title,
  showTitle,
  previewMessages = [],
  incomingAvatarUrl,
  incomingAvatarFallback,
  incomingBubbleVariant = 'default',
  receivingBubbleVariant = 'orange',
  className,
}: OpenQuestionPreviewChatHistoryProps) {
  const messages = useMemo(() => {
    const seed = buildSeedMessages({ nodeId, title, showTitle })
    const runtime = previewMessages.map(toChatHistoryMessage)
    return [...seed, ...runtime]
  }, [nodeId, previewMessages, showTitle, title])

  if (messages.length === 0) return null

  return (
    <ChatHistory
      messages={messages}
      className={className}
      incomingAvatarUrl={incomingAvatarUrl}
      incomingAvatarFallback={incomingAvatarFallback}
      incomingBubbleVariant={incomingBubbleVariant}
      receivingBubbleVariant={receivingBubbleVariant}
    />
  )
}
