'use client'

import { useMemo } from 'react'
import type { SerializedEditorState } from 'lexical'

import { ReceivingChatMessageBubble, SendingChatMessageBubble } from '@/components/shared/chat'
import type { ChatBubbleVariant } from '@/components/shared/chat/chat-bubble-variants'
import { cn } from '@/lib/utils'
import { GamePreviewChatHistoryFrame } from '../../../components/GamePreviewChatHistoryFrame'

export type OpenQuestionPreviewChatMessage = {
  id: string
  direction: 'sending' | 'receiving'
  text: string
  status?: 'loading' | 'ready'
  textBold?: boolean
}

type PreviewSeedMessage =
  | {
      id: string
      kind: 'lexical'
      lexicalContent: SerializedEditorState
      lexicalHydrationKey: string
    }
  | {
      id: string
      kind: 'text'
      text: string
    }

export type OpenQuestionPreviewChatHistoryProps = {
  nodeId: string
  descriptionContent: SerializedEditorState | null
  title: string
  showDescription: boolean
  showTitle: boolean
  previewMessages?: readonly OpenQuestionPreviewChatMessage[]
  editingMessageId?: string | null
  onEditSendingMessage?: (messageId: string, text: string) => void
  onDeleteSendingMessage?: (messageId: string) => void
  incomingAvatarUrl?: string
  incomingAvatarFallback: string
  incomingBubbleVariant?: ChatBubbleVariant
  receivingBubbleVariant?: ChatBubbleVariant
  className?: string
  /** When true, render messages only (parent owns scroll). */
  flat?: boolean
}

function buildSeedMessages({
  nodeId,
  descriptionContent,
  title,
  showDescription,
  showTitle,
}: Pick<
  OpenQuestionPreviewChatHistoryProps,
  'nodeId' | 'descriptionContent' | 'title' | 'showDescription' | 'showTitle'
>): PreviewSeedMessage[] {
  const messages: PreviewSeedMessage[] = []

  if (showDescription && descriptionContent) {
    messages.push({
      id: `${nodeId}-description`,
      kind: 'lexical',
      lexicalContent: descriptionContent,
      lexicalHydrationKey: `open-question-preview-description-${nodeId}`,
    })
  }

  // Title is only shown when there is no rich description (avoids duplicate bubbles).
  if (showTitle && !showDescription) {
    messages.push({
      id: `${nodeId}-title`,
      kind: 'text',
      text: title,
    })
  }

  return messages
}

export function OpenQuestionPreviewChatHistory({
  nodeId,
  descriptionContent,
  title,
  showDescription,
  showTitle,
  previewMessages = [],
  editingMessageId = null,
  onEditSendingMessage,
  onDeleteSendingMessage,
  incomingAvatarUrl,
  incomingAvatarFallback,
  incomingBubbleVariant = 'default',
  receivingBubbleVariant = 'orange',
  className,
  flat = false,
}: OpenQuestionPreviewChatHistoryProps) {
  const seedMessages = useMemo(
    () =>
      buildSeedMessages({
        nodeId,
        descriptionContent,
        title,
        showDescription,
        showTitle,
      }),
    [descriptionContent, nodeId, showDescription, showTitle, title],
  )

  const hasContent = seedMessages.length > 0 || previewMessages.length > 0

  return (
    <GamePreviewChatHistoryFrame
      hasContent={hasContent}
      flat={flat}
      className={className}
      scrollAreaClassName="bg-transparent"
      messageListClassName={cn(flat ? 'gap-2 py-0' : 'gap-4 py-1')}
    >
      {seedMessages.map((message) => (
        <div
          key={message.id}
          className="flex justify-start"
        >
          {message.kind === 'lexical' ? (
            <ReceivingChatMessageBubble
              contentMode="lexical"
              lexicalContent={message.lexicalContent}
              lexicalHydrationKey={message.lexicalHydrationKey}
              time=""
              avatarUrl={incomingAvatarUrl}
              avatarFallback={incomingAvatarFallback}
              variant={incomingBubbleVariant}
              messageId={message.id}
            />
          ) : (
            <ReceivingChatMessageBubble
              text={message.text}
              time=""
              avatarUrl={incomingAvatarUrl}
              avatarFallback={incomingAvatarFallback}
              variant={incomingBubbleVariant}
              messageId={message.id}
            />
          )}
        </div>
      ))}

      {previewMessages.map((message) => (
        <div
          key={message.id}
          className={cn('flex', message.direction === 'sending' ? 'justify-end' : 'justify-start')}
        >
          {message.direction === 'sending' ? (
            <SendingChatMessageBubble
              text={message.text}
              time=""
              avatarUrl={incomingAvatarUrl}
              avatarFallback={incomingAvatarFallback}
              variant={receivingBubbleVariant}
              status={message.status ?? 'ready'}
              messageId={message.id}
              editMode={editingMessageId === message.id}
              showHoverActions={onEditSendingMessage != null || onDeleteSendingMessage != null}
              onEdit={
                onEditSendingMessage
                  ? () => onEditSendingMessage(message.id, message.text)
                  : undefined
              }
              onDelete={
                onDeleteSendingMessage ? () => onDeleteSendingMessage(message.id) : undefined
              }
            />
          ) : (
            <ReceivingChatMessageBubble
              text={message.text}
              time=""
              avatarUrl={incomingAvatarUrl}
              avatarFallback={incomingAvatarFallback}
              variant={incomingBubbleVariant}
              status={message.status ?? 'ready'}
              messageId={message.id}
              textBold={message.textBold}
            />
          )}
        </div>
      ))}
    </GamePreviewChatHistoryFrame>
  )
}
