import { GripVertical } from 'lucide-react'
import type { JSX } from 'react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { moveRow } from './tableActions'
import type { LexicalEditor, NodeKey } from 'lexical'

export type RowGripOverlayProps = {
  editor: LexicalEditor
  tableKey: NodeKey
  anchorElem: HTMLElement
  wrapperEl: HTMLElement
  rowEls: HTMLTableRowElement[]
  hoveredRowIndex: number | null
  highlightedRowIndex: number | null
  onOpenMenu: (rowIndex: number, anchorRect: DOMRect) => void
}

const DRAG_THRESHOLD = 4

export function RowGripOverlay({
  editor,
  tableKey,
  anchorElem,
  wrapperEl,
  rowEls,
  hoveredRowIndex,
  highlightedRowIndex,
  onOpenMenu,
}: RowGripOverlayProps): JSX.Element | null {
  const [dragInfo, setDragInfo] = useState<{
    fromIndex: number
    pointerY: number
    insertionIndex: number
  } | null>(null)
  const dragStartRef = useRef<{ index: number; startY: number; armed: boolean } | null>(null)

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = dragStartRef.current
      if (!state) return
      const deltaY = Math.abs(e.clientY - state.startY)
      if (!state.armed && deltaY < DRAG_THRESHOLD) return
      state.armed = true
      let insertionIndex = 0
      for (let i = 0; i < rowEls.length; i++) {
        const rect = rowEls[i].getBoundingClientRect()
        const mid = rect.top + rect.height / 2
        if (e.clientY > mid) insertionIndex = i + 1
      }
      setDragInfo({ fromIndex: state.index, pointerY: e.clientY, insertionIndex })
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
            moveRow(editor, tableKey, current.fromIndex, toIndex)
          }
        } else if (!wasArmed) {
          const target = e.target as HTMLElement | null
          const gripEl = target?.closest('[data-row-grip-index]') as HTMLElement | null
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
  }, [editor, tableKey, rowEls, onOpenMenu])

  const handlePointerDown = (rowIndex: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragStartRef.current = { index: rowIndex, startY: e.clientY, armed: false }
  }

  const anchorRect = anchorElem.getBoundingClientRect()

  return (
    <>
      {rowEls.map((rowEl, index) => {
        const rowRect = rowEl.getBoundingClientRect()
        const visible =
          hoveredRowIndex === index ||
          highlightedRowIndex === index ||
          dragInfo?.fromIndex === index
        const top = rowRect.top - anchorRect.top + anchorElem.scrollTop + rowRect.height / 2 - 12
        const left = rowRect.left - anchorRect.left + anchorElem.scrollLeft - 22

        return (
          <button
            key={`row-grip-${index}`}
            type="button"
            data-row-grip-index={index}
            aria-label={`Row ${index + 1} actions`}
            onPointerDown={handlePointerDown(index)}
            className={cn(
              'absolute z-30 flex h-6 w-5 cursor-grab items-center justify-center rounded text-muted-foreground transition-opacity hover:bg-accent hover:text-foreground',
              visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
              dragInfo?.fromIndex === index && 'cursor-grabbing',
            )}
            style={{ top, left }}
          >
            <GripVertical className="size-4" />
          </button>
        )
      })}
      {dragInfo && wrapperEl ? (
        <DragInsertionLine
          anchorElem={anchorElem}
          insertionIndex={dragInfo.insertionIndex}
          rowEls={rowEls}
          wrapperEl={wrapperEl}
        />
      ) : null}
    </>
  )
}

function DragInsertionLine({
  anchorElem,
  insertionIndex,
  rowEls,
  wrapperEl,
}: {
  anchorElem: HTMLElement
  insertionIndex: number
  rowEls: HTMLTableRowElement[]
  wrapperEl: HTMLElement
}) {
  const anchorRect = anchorElem.getBoundingClientRect()
  const wrapperRect = wrapperEl.getBoundingClientRect()
  let lineY: number
  if (insertionIndex === 0 && rowEls[0]) {
    lineY = rowEls[0].getBoundingClientRect().top
  } else if (insertionIndex >= rowEls.length) {
    const last = rowEls[rowEls.length - 1]
    lineY = last ? last.getBoundingClientRect().bottom : wrapperRect.bottom
  } else {
    const row = rowEls[insertionIndex]
    lineY = row.getBoundingClientRect().top
  }
  return (
    <div
      className="pointer-events-none absolute z-40 h-0.5 bg-blue-500"
      style={{
        top: lineY - anchorRect.top + anchorElem.scrollTop - 1,
        left: wrapperRect.left - anchorRect.left + anchorElem.scrollLeft,
        width: wrapperRect.width,
      }}
    />
  )
}
