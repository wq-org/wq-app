import { GripHorizontal } from 'lucide-react'
import type { JSX, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { moveColumn } from './tableActions'
import type { LexicalEditor, NodeKey } from 'lexical'
import { computeDropIndex } from './tableInteractionUtils'

export type ColGripOverlayProps = {
  editor: LexicalEditor
  tableKey: NodeKey
  anchorElem: HTMLElement
  wrapperEl: HTMLElement
  firstRowCellEls: HTMLTableCellElement[]
  hoveredColIndex: number | null
  highlightedColIndex: number | null
  onOpenMenu: (colIndex: number, anchorRect: DOMRect) => void
}

const DRAG_THRESHOLD = 4

export function ColGripOverlay({
  editor,
  tableKey,
  anchorElem,
  wrapperEl,
  firstRowCellEls,
  hoveredColIndex,
  highlightedColIndex,
  onOpenMenu,
}: ColGripOverlayProps): JSX.Element | null {
  const [dragInfo, setDragInfo] = useState<{
    fromIndex: number
    targetIndex: number
    position: 'before' | 'after'
  } | null>(null)
  const dragStartRef = useRef<{ index: number; startX: number; armed: boolean } | null>(null)

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = dragStartRef.current
      if (!state) return
      const deltaX = Math.abs(e.clientX - state.startX)
      if (!state.armed && deltaX < DRAG_THRESHOLD) return
      state.armed = true
      const midpoints = firstRowCellEls.map((cellEl) => {
        const rect = cellEl.getBoundingClientRect()
        return rect.left + rect.width / 2
      })
      const dropIndex = computeDropIndex(midpoints, e.clientX, state.index)
      const lastMidpoint = midpoints[midpoints.length - 1]
      const isAfterLast = lastMidpoint !== undefined && e.clientX > lastMidpoint
      setDragInfo({
        fromIndex: state.index,
        targetIndex: isAfterLast ? firstRowCellEls.length - 1 : dropIndex,
        position: isAfterLast ? 'after' : 'before',
      })
    }
    const handleUp = () => {
      const state = dragStartRef.current
      dragStartRef.current = null
      if (!state) return
      const wasArmed = state.armed
      setDragInfo((current) => {
        if (current && wasArmed) {
          if (current.targetIndex !== current.fromIndex) {
            moveColumn(
              editor,
              tableKey,
              current.fromIndex,
              current.targetIndex,
              current.position,
            )
          }
        } else if (!wasArmed) {
          const cellEl = firstRowCellEls[state.index]
          if (cellEl) {
            const rect = cellEl.getBoundingClientRect()
            onOpenMenu(state.index, rect)
          }
        }
        return null
      })
    }
    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
    return () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
    }
  }, [editor, tableKey, firstRowCellEls, onOpenMenu])

  const handlePointerDown =
    (colIndex: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dragStartRef.current = { index: colIndex, startX: e.clientX, armed: false }
    }

  const anchorRect = anchorElem.getBoundingClientRect()

  return (
    <>
      {firstRowCellEls.map((cellEl, index) => {
        const cellRect = cellEl.getBoundingClientRect()
        const visible =
          hoveredColIndex === index ||
          highlightedColIndex === index ||
          dragInfo?.fromIndex === index
        const top = cellRect.top - anchorRect.top + anchorElem.scrollTop - 14
        const left =
          cellRect.left - anchorRect.left + anchorElem.scrollLeft + cellRect.width / 2 - 14

        return (
          <button
            key={`col-grip-${index}`}
            type="button"
            data-col-grip-index={index}
            aria-label={`Column ${index + 1} actions`}
            onPointerDown={handlePointerDown(index)}
            className={cn(
              'absolute z-30 flex size-7 cursor-grab items-center justify-center rounded-sm text-muted-foreground transition-opacity hover:bg-blue-100 hover:text-foreground dark:hover:bg-blue-900/40',
              visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
              dragInfo?.fromIndex === index && 'cursor-grabbing',
            )}
            style={{ top, left }}
          >
            <GripHorizontal className="size-4" />
          </button>
        )
      })}
      {dragInfo && wrapperEl ? (
        <DragInsertionLine
          anchorElem={anchorElem}
          cellEls={firstRowCellEls}
          position={dragInfo.position}
          targetIndex={dragInfo.targetIndex}
          wrapperEl={wrapperEl}
        />
      ) : null}
    </>
  )
}

function DragInsertionLine({
  anchorElem,
  cellEls,
  position,
  targetIndex,
  wrapperEl,
}: {
  anchorElem: HTMLElement
  cellEls: HTMLTableCellElement[]
  position: 'before' | 'after'
  targetIndex: number
  wrapperEl: HTMLElement
}) {
  const anchorRect = anchorElem.getBoundingClientRect()
  const wrapperRect = wrapperEl.getBoundingClientRect()
  const cell = cellEls[targetIndex]
  const cellRect = cell?.getBoundingClientRect()
  const lineX = cellRect
    ? position === 'after'
      ? cellRect.right
      : cellRect.left
    : wrapperRect.right
  return (
    <div
      className="pointer-events-none absolute z-40 w-0.5 bg-blue-500"
      style={{
        left: lineX - anchorRect.left + anchorElem.scrollLeft - 1,
        top: wrapperRect.top - anchorRect.top + anchorElem.scrollTop,
        height: wrapperRect.height,
      }}
    />
  )
}
