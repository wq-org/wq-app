'use client'

import { useMemo } from 'react'
import type { SerializedEditorState } from 'lexical'

import { ReceivingChatMessageBubble } from '@/components/shared/chat'
import type { ChatBubbleVariant } from '@/components/shared/chat/chat-bubble-variants'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

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
      hideAvatar: boolean
    }

export type DragDropMathPreviewChatHistoryProps = {
  nodeId: string
  descriptionContent: SerializedEditorState | null
  title: string
  showDescription: boolean
  showTitle: boolean
  avatarUrl?: string
  avatarFallback: string
  bubbleVariant?: ChatBubbleVariant
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
      hideAvatar: showDescription,
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
  avatarUrl,
  avatarFallback,
  bubbleVariant = 'default',
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

  if (messages.length === 0) {
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
                  variant={bubbleVariant}
                  messageId={message.id}
                />
              ) : (
                <ReceivingChatMessageBubble
                  text={message.text}
                  time=""
                  avatarUrl={avatarUrl}
                  avatarFallback={avatarFallback}
                  hideAvatar={message.hideAvatar}
                  variant={bubbleVariant}
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
