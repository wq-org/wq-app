import { GripHorizontal } from 'lucide-react'
import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { moveColumn } from './tableActions'
import type { LexicalEditor, NodeKey } from 'lexical'

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
    pointerX: number
    insertionIndex: number
  } | null>(null)
  const dragStartRef = useRef<{ index: number; startX: number; armed: boolean } | null>(null)

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = dragStartRef.current
      if (!state) return
      const deltaX = Math.abs(e.clientX - state.startX)
      if (!state.armed && deltaX < DRAG_THRESHOLD) return
      state.armed = true
      let insertionIndex = 0
      for (let i = 0; i < firstRowCellEls.length; i++) {
        const rect = firstRowCellEls[i].getBoundingClientRect()
        const mid = rect.left + rect.width / 2
        if (e.clientX > mid) insertionIndex = i + 1
      }
      setDragInfo({ fromIndex: state.index, pointerX: e.clientX, insertionIndex })
    }
    const handleUp = (e: PointerEvent) => {
      const state = dragStartRef.current
      dragStartRef.current = null
      if (!state) return
      const wasArmed = state.armed
      setDragInfo((current) => {
        if (current && wasArmed) {
          let toIndex = current.insertionIndex
          if (toIndex > current.fromIndex) toIndex -= 1
          if (toIndex !== current.fromIndex) {
            moveColumn(editor, tableKey, current.fromIndex, toIndex)
          }
        } else if (!wasArmed) {
          const target = e.target as HTMLElement | null
          const gripEl = target?.closest('[data-col-grip-index]') as HTMLElement | null
          const rect = gripEl?.getBoundingClientRect() ?? null
          if (rect) onOpenMenu(state.index, rect)
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

  const handlePointerDown = (colIndex: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
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
        const top = cellRect.top - anchorRect.top + anchorElem.scrollTop - 22
        const left =
          cellRect.left - anchorRect.left + anchorElem.scrollLeft + cellRect.width / 2 - 12

        return (
          <button
            key={`col-grip-${index}`}
            type="button"
            data-col-grip-index={index}
            aria-label={`Column ${index + 1} actions`}
            onPointerDown={handlePointerDown(index)}
            className={cn(
              'absolute z-30 flex h-5 w-6 cursor-grab items-center justify-center rounded text-muted-foreground transition-opacity hover:bg-accent hover:text-foreground',
              visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
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
          insertionIndex={dragInfo.insertionIndex}
          cellEls={firstRowCellEls}
          wrapperEl={wrapperEl}
        />
      ) : null}
    </>
  )
}

function DragInsertionLine({
  anchorElem,
  insertionIndex,
  cellEls,
  wrapperEl,
}: {
  anchorElem: HTMLElement
  insertionIndex: number
  cellEls: HTMLTableCellElement[]
  wrapperEl: HTMLElement
}) {
  const anchorRect = anchorElem.getBoundingClientRect()
  const wrapperRect = wrapperEl.getBoundingClientRect()
  let lineX: number
  if (insertionIndex === 0 && cellEls[0]) {
    lineX = cellEls[0].getBoundingClientRect().left
  } else if (insertionIndex >= cellEls.length) {
    const last = cellEls[cellEls.length - 1]
    lineX = last ? last.getBoundingClientRect().right : wrapperRect.right
  } else {
    const cell = cellEls[insertionIndex]
    lineX = cell.getBoundingClientRect().left
  }
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
