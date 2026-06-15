'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DndContext } from '@dnd-kit/core'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

import { GAME_PREVIEW_SCROLL_END_ATTR } from './gamePreviewSession.constants'
import {
  GamePreviewSessionContext,
  type GamePreviewDndSession,
  type GamePreviewSessionContextValue,
} from './GamePreviewSessionContext'
import { scrollPreviewSegmentIntoView, scrollPreviewViewportToLatest } from './gamePreviewScroll'

export type GamePreviewSessionShellProps = {
  children: ReactNode
  header?: ReactNode
  className?: string
  /** Extra classes on the scrollable content column (e.g. bottom padding above fixed footer). */
  scrollContentClassName?: string
  /** Extra classes on the sticky footer chrome (chat inputs, canvas panel, etc.). */
  footerClassName?: string
}

export function GamePreviewSessionShell({
  children,
  header,
  className,
  scrollContentClassName,
  footerClassName,
}: GamePreviewSessionShellProps) {
  const [footerContent, setFooterContent] = useState<ReactNode | null>(null)
  const [dndSession, setDndSession] = useState<GamePreviewDndSession | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const pendingScrollCleanupRef = useRef<(() => void) | null>(null)
  const followScrollTimerRef = useRef<number | null>(null)

  const registerFooter = useCallback((content: ReactNode | null) => {
    setFooterContent(content)
  }, [])

  const registerDndSession = useCallback((session: GamePreviewDndSession | null) => {
    setDndSession(session)
  }, [])

  const scrollToLatestContent = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    if (followScrollTimerRef.current !== null) {
      window.clearTimeout(followScrollTimerRef.current)
    }

    followScrollTimerRef.current = window.setTimeout(() => {
      followScrollTimerRef.current = null
      scrollPreviewViewportToLatest(viewport)
    }, 80)
  }, [])

  const scrollToSegment = useCallback((element: HTMLElement) => {
    const viewport = viewportRef.current
    if (!viewport) return

    pendingScrollCleanupRef.current?.()
    pendingScrollCleanupRef.current = null

    const scroll = () => {
      scrollPreviewSegmentIntoView(viewport, element)
      scrollPreviewViewportToLatest(viewport)
    }

    requestAnimationFrame(() => {
      scroll()
      requestAnimationFrame(scroll)
    })

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(() => scroll())
      observer.observe(element)
      const content = viewport.firstElementChild
      if (content instanceof HTMLElement) {
        observer.observe(content)
      }

      const timeoutId = window.setTimeout(() => {
        observer.disconnect()
        if (pendingScrollCleanupRef.current === cleanup) {
          pendingScrollCleanupRef.current = null
        }
      }, 800)

      const cleanup = () => {
        observer.disconnect()
        window.clearTimeout(timeoutId)
      }
      pendingScrollCleanupRef.current = cleanup
    }
  }, [])

  useEffect(() => {
    return () => {
      pendingScrollCleanupRef.current?.()
      pendingScrollCleanupRef.current = null
      if (followScrollTimerRef.current !== null) {
        window.clearTimeout(followScrollTimerRef.current)
      }
    }
  }, [])

  const contextValue = useMemo<GamePreviewSessionContextValue>(
    () => ({ registerFooter, registerDndSession, scrollToSegment, scrollToLatestContent }),
    [registerDndSession, registerFooter, scrollToLatestContent, scrollToSegment],
  )

  const body = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BlurredScrollArea
        className={cn('min-h-0 w-full overflow-hidden', footerContent ? 'shrink' : 'flex-1')}
        viewportClassName="min-h-0"
        viewportRef={viewportRef}
      >
        <div className={cn('flex flex-col gap-3 px-1 pb-2', scrollContentClassName)}>
          {children}
          <div
            {...{ [GAME_PREVIEW_SCROLL_END_ATTR]: '' }}
            className="h-px w-full shrink-0"
            aria-hidden
          />
        </div>
      </BlurredScrollArea>

      {footerContent ? (
        <>
          <div
            className="min-h-0 flex-1 shrink"
            aria-hidden="true"
          />
          <div
            className={cn(
              'z-10 flex w-full shrink-0 flex-col gap-2 border-t border-border/60 bg-background/95 px-2 pt-2 pb-2 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
              footerClassName,
            )}
          >
            {footerContent}
          </div>
        </>
      ) : null}
    </div>
  )

  return (
    <GamePreviewSessionContext.Provider value={contextValue}>
      <div className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-hidden', className)}>
        {header}

        {dndSession ? (
          <DndContext
            modifiers={dndSession.modifiers}
            onDragStart={dndSession.onDragStart}
            onDragEnd={dndSession.onDragEnd}
            onDragCancel={dndSession.onDragCancel}
          >
            {body}
            {dndSession.overlay}
          </DndContext>
        ) : (
          body
        )}
      </div>
    </GamePreviewSessionContext.Provider>
  )
}

export const IfElsePreviewSessionShell = GamePreviewSessionShell
export type IfElsePreviewSessionShellProps = GamePreviewSessionShellProps
