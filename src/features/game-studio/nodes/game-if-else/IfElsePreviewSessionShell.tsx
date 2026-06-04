'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DndContext } from '@dnd-kit/core'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

import {
  IfElsePreviewSessionContext,
  type IfElsePreviewDndSession,
  type IfElsePreviewSessionContextValue,
} from './IfElsePreviewSessionContext'
import { scrollIfElseSegmentIntoView } from './ifElsePreviewScroll'

export type IfElsePreviewSessionShellProps = {
  children: ReactNode
  header?: ReactNode
  className?: string
}

export function IfElsePreviewSessionShell({
  children,
  header,
  className,
}: IfElsePreviewSessionShellProps) {
  const [footerContent, setFooterContent] = useState<ReactNode | null>(null)
  const [dndSession, setDndSession] = useState<IfElsePreviewDndSession | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const pendingScrollCleanupRef = useRef<(() => void) | null>(null)

  const registerFooter = useCallback((content: ReactNode | null) => {
    setFooterContent(content)
  }, [])

  const registerDndSession = useCallback((session: IfElsePreviewDndSession | null) => {
    setDndSession(session)
  }, [])

  const scrollToSegment = useCallback((element: HTMLElement) => {
    const viewport = viewportRef.current
    if (!viewport) return

    pendingScrollCleanupRef.current?.()
    pendingScrollCleanupRef.current = null

    const scroll = () => scrollIfElseSegmentIntoView(viewport, element)

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
    }
  }, [])

  const contextValue = useMemo<IfElsePreviewSessionContextValue>(
    () => ({ registerFooter, registerDndSession, scrollToSegment }),
    [registerDndSession, registerFooter, scrollToSegment],
  )

  const body = (
    <>
      <BlurredScrollArea
        className="min-h-0 flex-1"
        viewportClassName="min-h-0"
        viewportRef={viewportRef}
      >
        <div className="flex flex-col gap-6 px-1 pb-4">{children}</div>
      </BlurredScrollArea>

      {footerContent ? (
        <div className="flex shrink-0 flex-col gap-3 border-t border-border/60 pt-3">
          {footerContent}
        </div>
      ) : null}
    </>
  )

  return (
    <IfElsePreviewSessionContext.Provider value={contextValue}>
      <div className={cn('flex h-full min-h-0 flex-col gap-3', className)}>
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
    </IfElsePreviewSessionContext.Provider>
  )
}
