'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { SerializedEditorState } from 'lexical'

import { ReceivingChatMessageBubble, SendingChatMessageBubble } from '@/components/shared/chat'
import type { ChatBubbleVariant } from '@/components/shared/chat/chat-bubble-variants'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { DnDMathPreviewGameMessage } from '../hooks/useDnDMathPreviewGame'
import {
  isSigmaCanvasRow,
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
} from '../types/drag-drop-math.schema'
import { isFixedMathSuffixToken } from '../utils/mathEquationRow'
import { DropMathStaticNode } from './DropMathStaticNode'

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

export type DnDMathPreviewChatHistoryProps = {
  nodeId: string
  descriptionContent: SerializedEditorState | null
  title: string
  showDescription: boolean
  showTitle: boolean
  previewMessages?: readonly DnDMathPreviewGameMessage[]
  avatarUrl?: string
  avatarFallback: string
  incomingBubbleVariant?: ChatBubbleVariant
  receivingBubbleVariant?: ChatBubbleVariant
  className?: string
  flat?: boolean
}

function buildPreviewMessages({
  nodeId,
  descriptionContent,
  title,
  showDescription,
  showTitle,
}: Pick<
  DnDMathPreviewChatHistoryProps,
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

  if (showTitle && !showDescription) {
    messages.push({
      id: `${nodeId}-title`,
      kind: 'text',
      text: title,
    })
  }

  return messages
}

export function DnDMathPreviewChatHistory({
  nodeId,
  descriptionContent,
  title,
  showDescription,
  showTitle,
  previewMessages = [],
  avatarUrl,
  avatarFallback,
  incomingBubbleVariant = 'default',
  receivingBubbleVariant = 'orange',
  className,
  flat = false,
}: DnDMathPreviewChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (flat) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [flat, previewMessages, messages])

  const hasContent = messages.length > 0 || previewMessages.length > 0

  if (!hasContent) {
    return null
  }

  const renderMathRows = (rows: readonly DragDropMathCanvasRow[]) => {
    return (
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => {
          if (isSigmaCanvasRow(row)) {
            return (
              <div
                key={row.id}
                className="flex items-center gap-2"
              >
                <Text
                  as="span"
                  variant="small"
                  muted
                >
                  Σ
                </Text>
                <DropMathStaticNode
                  value={row.resultDisplay ?? '0'}
                  mathShell="ghost"
                />
              </div>
            )
          }
          if (!isTokenCanvasRow(row)) return null
          return (
            <div
              key={row.id}
              className="flex flex-wrap items-center gap-2"
            >
              {row.tokens.map((token) => {
                if (token.variant === 'math') {
                  return (
                    <DropMathStaticNode
                      key={token.id}
                      value={token.value}
                      mathShell={token.mathShell}
                      compact={isFixedMathSuffixToken(token)}
                    />
                  )
                }
                return (
                  <span
                    key={token.id}
                    className="rounded-lg border border-border bg-muted/30 px-2 py-1 text-xs"
                  >
                    {token.value}
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  const messageList = (
    <div className={cn('flex flex-col', flat ? 'gap-2 py-0' : 'gap-4 py-1')}>
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

      {previewMessages.map((message) => (
        <div
          key={message.id}
          className={cn('flex', message.direction === 'sending' ? 'justify-end' : 'justify-start')}
        >
          {message.direction === 'sending' ? (
            <SendingChatMessageBubble
              contentMode={message.kind === 'math' ? 'math' : 'text'}
              text={message.text ?? ''}
              mathContent={message.kind === 'math' ? renderMathRows(message.rows ?? []) : undefined}
              time=""
              avatarUrl={avatarUrl}
              avatarFallback={avatarFallback}
              variant={receivingBubbleVariant}
              status={message.kind === 'loading' ? 'loading' : 'ready'}
              messageId={message.id}
            />
          ) : (
            <ReceivingChatMessageBubble
              contentMode={message.kind === 'math' ? 'math' : 'text'}
              text={message.text ?? ''}
              mathContent={message.kind === 'math' ? renderMathRows(message.rows ?? []) : undefined}
              time=""
              avatarUrl={avatarUrl}
              avatarFallback={avatarFallback}
              variant={incomingBubbleVariant}
              status={message.kind === 'loading' ? 'loading' : 'ready'}
              messageId={message.id}
              textBold={message.bold}
            />
          )}
        </div>
      ))}
      {!flat ? <div ref={bottomRef} /> : null}
    </div>
  )

  if (flat) {
    return <div className={cn('w-full min-w-0', className)}>{messageList}</div>
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
        {messageList}
      </BlurredScrollArea>
    </div>
  )
}
