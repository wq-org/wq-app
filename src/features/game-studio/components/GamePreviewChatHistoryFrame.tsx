'use client'

import { useEffect, useRef, type ReactNode, type Ref } from 'react'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

const PREVIEW_CHAT_HISTORY_MIN_HEIGHT = 'min-h-[min(44vh,32rem)]' as const

export type GamePreviewChatHistoryFrameProps = {
  children: ReactNode
  hasContent: boolean
  className?: string
  messageListClassName?: string
  scrollAreaClassName?: string
  viewportClassName?: string
  listRef?: Ref<HTMLDivElement>
  flat?: boolean
  autoScroll?: boolean
  hideScrollBar?: boolean
  reservePreviewHeight?: boolean
}

export function GamePreviewChatHistoryFrame({
  children,
  hasContent,
  className,
  messageListClassName,
  scrollAreaClassName,
  viewportClassName,
  listRef,
  flat = false,
  autoScroll = true,
  hideScrollBar = true,
  reservePreviewHeight = true,
}: GamePreviewChatHistoryFrameProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (flat || !autoScroll) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  })

  if (flat && !hasContent) {
    return null
  }

  const messageList = (
    <div
      ref={listRef}
      className={cn('flex flex-col', flat ? 'gap-2 py-0' : 'gap-4 py-1', messageListClassName)}
    >
      {children}
      {!flat ? <div ref={bottomRef} /> : null}
    </div>
  )

  if (flat) {
    return <div className={cn('w-full min-w-0', className)}>{messageList}</div>
  }

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[1.25rem]',
        reservePreviewHeight ? PREVIEW_CHAT_HISTORY_MIN_HEIGHT : 'min-h-0',
        className,
      )}
    >
      <BlurredScrollArea
        className={cn('flex h-full min-h-0 flex-1 flex-col', scrollAreaClassName)}
        hideScrollBar={hideScrollBar}
        viewportClassName={cn(
          'min-h-0 max-h-full flex-1 basis-0 [&>div]:!block [&>div]:min-h-0',
          viewportClassName,
        )}
      >
        {messageList}
      </BlurredScrollArea>
    </div>
  )
}
