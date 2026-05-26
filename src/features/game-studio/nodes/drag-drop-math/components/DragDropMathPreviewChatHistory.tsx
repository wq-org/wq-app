'use client'

import { useMemo } from 'react'
import type { SerializedEditorState } from 'lexical'

import { ReceivingChatMessageBubble, SendingChatMessageBubble } from '@/components/shared/chat'
import type { ChatBubbleVariant } from '@/components/shared/chat/chat-bubble-variants'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

import type { DragDropMathPreviewPromptMessage } from '../utils/dragDropMathPreviewMessages'

type PreviewChatMessage =
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

export type DragDropMathPreviewChatHistoryProps = {
  nodeId: string
  descriptionContent: SerializedEditorState | null
  title: string
  showDescription: boolean
  showTitle: boolean
  promptMessages?: readonly DragDropMathPreviewPromptMessage[]
  avatarUrl?: string
  avatarFallback: string
  incomingBubbleVariant?: ChatBubbleVariant
  receivingBubbleVariant?: ChatBubbleVariant
  className?: string
}

function buildPreviewMessages({
  nodeId,
  descriptionContent,
  title,
  showDescription,
  showTitle,
}: Pick<
  DragDropMathPreviewChatHistoryProps,
  'nodeId' | 'descriptionContent' | 'title' | 'showDescription' | 'showTitle'
>): PreviewChatMessage[] {
  const messages: PreviewChatMessage[] = []

  if (showDescription && descriptionContent) {
    messages.push({
      id: `${nodeId}-description`,
      kind: 'lexical',
      lexicalContent: descriptionContent,
      lexicalHydrationKey: `drag-drop-math-preview-description-${nodeId}`,
    })
  }

  if (showTitle) {
    messages.push({
      id: `${nodeId}-title`,
      kind: 'text',
      text: title,
    })
  }

  return messages
}

export function DragDropMathPreviewChatHistory({
  nodeId,
  descriptionContent,
  title,
  showDescription,
  showTitle,
  promptMessages = [],
  avatarUrl,
  avatarFallback,
  incomingBubbleVariant = 'default',
  receivingBubbleVariant = 'orange',
  className,
}: DragDropMathPreviewChatHistoryProps) {
  const messages = useMemo(
    () =>
      buildPreviewMessages({
        nodeId,
        descriptionContent,
        title,
        showDescription,
        showTitle,
      }),
    [descriptionContent, nodeId, showDescription, showTitle, title],
  )

  const hasContent = messages.length > 0 || promptMessages.length > 0

  if (!hasContent) {
    return null
  }

  return (
    <div
      className={cn(
        'flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[1.25rem]',
        className,
      )}
    >
      <BlurredScrollArea
        className="flex h-full min-h-0 flex-1 flex-col bg-transparent"
        hideScrollBar
        viewportClassName="min-h-0 max-h-full flex-1 basis-0 [&>div]:!block [&>div]:min-h-0"
      >
        <div className="flex flex-col gap-4 pb-2 pt-1">
          {messages.map((message) => (
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
                  avatarUrl={avatarUrl}
                  avatarFallback={avatarFallback}
                  variant={incomingBubbleVariant}
                  messageId={message.id}
                />
              ) : (
                <ReceivingChatMessageBubble
                  text={message.text}
                  time=""
                  avatarUrl={avatarUrl}
                  avatarFallback={avatarFallback}
                  variant={incomingBubbleVariant}
                  messageId={message.id}
                />
              )}
            </div>
          ))}

          {promptMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.direction === 'sending' ? 'justify-end' : 'justify-start',
              )}
            >
              {message.direction === 'sending' ? (
                <SendingChatMessageBubble
                  text={message.text}
                  time=""
                  avatarUrl={avatarUrl}
                  avatarFallback={avatarFallback}
                  variant={receivingBubbleVariant}
                  messageId={message.id}
                />
              ) : (
                <ReceivingChatMessageBubble
                  text={message.text}
                  time=""
                  avatarUrl={avatarUrl}
                  avatarFallback={avatarFallback}
                  variant={incomingBubbleVariant}
                  messageId={message.id}
                />
              )}
            </div>
          ))}
        </div>
      </BlurredScrollArea>
    </div>
  )
}
