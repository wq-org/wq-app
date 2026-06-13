import { useEffect, useRef, useState } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_LOW, SELECTION_CHANGE_COMMAND } from 'lexical'

import { cn } from '@/lib/utils'

const HANDLE_DIAMETER_PX = 16

type HandlePosition = {
  top: number
  left: number
}

type SelectionHandlePlacement = 'start' | 'end'

export type SelectionHandlesProps = {
  /** The positioning container; handles render absolutely inside this element. */
  container: HTMLElement | null
}

function computeHandlePositions(container: HTMLElement): {
  start: HandlePosition
  end: HandlePosition
} | null {
  const domSelection = window.getSelection()
  if (!domSelection || domSelection.isCollapsed || domSelection.rangeCount === 0) {
    return null
  }

  const range = domSelection.getRangeAt(0)
  if (!container.contains(range.commonAncestorContainer)) {
    return null
  }

  const rangeRects = range.getClientRects()
  if (rangeRects.length === 0) {
    return null
  }

  const startRange = range.cloneRange()
  startRange.collapse(true)
  const firstRect = startRange.getClientRects()[0] ?? rangeRects[0]

  const endRange = range.cloneRange()
  endRange.collapse(false)
  const endRects = endRange.getClientRects()
  const lastRect = endRects[endRects.length - 1] ?? rangeRects[rangeRects.length - 1]

  if (!firstRect || !lastRect) {
    return null
  }

  const containerRect = container.getBoundingClientRect()
  const scrollTop = container.scrollTop
  const scrollLeft = container.scrollLeft

  return {
    start: {
      top: firstRect.top - containerRect.top + scrollTop - HANDLE_DIAMETER_PX,
      left: firstRect.left - containerRect.left + scrollLeft,
    },
    end: {
      top: lastRect.bottom - containerRect.top + scrollTop,
      left: lastRect.right - containerRect.left + scrollLeft,
    },
  }
}

function SelectionHandle({
  placement,
  position,
}: {
  placement: SelectionHandlePlacement
  position: HandlePosition
}) {
  const isStart = placement === 'start'

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute z-50 w-4 -translate-x-1/2"
      style={{ top: position.top, left: position.left }}
    >
      <span
        className={cn(
          'absolute left-1/2 h-4 w-0.5 -translate-x-1/2 rounded-full bg-blue-500',
          isStart ? 'top-3' : 'top-0',
        )}
      />
      <span
        className={cn(
          'absolute left-0 size-4 rounded-full bg-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.55)]',
          isStart ? 'top-0' : 'top-3',
        )}
      />
    </span>
  )
}

export function SelectionHandles({ container }: SelectionHandlesProps) {
  const [editor] = useLexicalComposerContext()
  const [startPos, setStartPos] = useState<HandlePosition | null>(null)
  const [endPos, setEndPos] = useState<HandlePosition | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!container) {
      setStartPos(null)
      setEndPos(null)
      return
    }

    const cancelPendingFrame = () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }

    const updatePositions = () => {
      const positions = computeHandlePositions(container)
      if (!positions) {
        setStartPos(null)
        setEndPos(null)
        return
      }
      setStartPos(positions.start)
      setEndPos(positions.end)
    }

    const scheduleUpdate = () => {
      cancelPendingFrame()
      frameRef.current = requestAnimationFrame(updatePositions)
    }

    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        scheduleUpdate()
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    container.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      unregister()
      container.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      cancelPendingFrame()
    }
  }, [container, editor])

  if (!startPos && !endPos) {
    return null
  }

  return (
    <>
      {startPos ? (
        <SelectionHandle
          placement="start"
          position={startPos}
        />
      ) : null}
      {endPos ? (
        <SelectionHandle
          placement="end"
          position={endPos}
        />
      ) : null}
    </>
  )
}
