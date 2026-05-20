import { GripVertical } from 'lucide-react'
import type { JSX, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

import { $isTableRowNode } from '@lexical/table'
import { $getNearestNodeFromDOMNode, type LexicalEditor, type NodeKey } from 'lexical'

import { cn } from '@/lib/utils'

import { moveRow } from './tableActions'
import { computeDropIndex } from './tableInteractionUtils'

export type RowGripOverlayProps = {
  editor: LexicalEditor
  tableKey: NodeKey
  anchorElem: HTMLElement
  wrapperEl: HTMLElement
  rowEls: HTMLTableRowElement[]
  hoveredRowIndex: number | null
  highlightedRowIndex: number | null
  onOpenMenu: (rowIndex: number, rowKey: NodeKey, anchorRect: DOMRect) => void
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
    targetIndex: number
    position: 'before' | 'after'
  } | null>(null)
  const dragStartRef = useRef<{ index: number; startY: number; armed: boolean } | null>(null)

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = dragStartRef.current
      if (!state) return
      const deltaY = Math.abs(e.clientY - state.startY)
      if (!state.armed && deltaY < DRAG_THRESHOLD) return
      state.armed = true
      const midpoints = rowEls.map((rowEl) => {
        const rect = rowEl.getBoundingClientRect()
        return rect.top + rect.height / 2
      })
      const dropIndex = computeDropIndex(midpoints, e.clientY, state.index)
      const lastMidpoint = midpoints[midpoints.length - 1]
      const isAfterLast = lastMidpoint !== undefined && e.clientY > lastMidpoint
      setDragInfo({
        fromIndex: state.index,
        targetIndex: isAfterLast ? rowEls.length - 1 : dropIndex,
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
            const fromRowEl = rowEls[current.fromIndex]
            const targetRowEl = rowEls[current.targetIndex]
            if (fromRowEl && targetRowEl) {
              const fromKey = editor.read(() => {
                const node = $getNearestNodeFromDOMNode(fromRowEl)
                return $isTableRowNode(node) ? node.getKey() : null
              })
              const targetKey = editor.read(() => {
                const node = $getNearestNodeFromDOMNode(targetRowEl)
                return $isTableRowNode(node) ? node.getKey() : null
              })
              if (fromKey && targetKey) {
                moveRow(editor, tableKey, fromKey, targetKey, current.position)
              }
            }
          }
        } else if (!wasArmed) {
          const rowEl = rowEls[state.index]
          if (rowEl) {
            const rect = rowEl.getBoundingClientRect()
            const rowKey = editor.read(() => {
              const node = $getNearestNodeFromDOMNode(rowEl)
              return $isTableRowNode(node) ? node.getKey() : null
            })
            if (rowKey) {
              onOpenMenu(state.index, rowKey, rect)
            }
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
  }, [editor, tableKey, rowEls, onOpenMenu])

  const handlePointerDown =
    (rowIndex: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
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
        const top = rowRect.top - anchorRect.top + anchorElem.scrollTop + rowRect.height / 2 - 14
        const left = rowRect.left - anchorRect.left + anchorElem.scrollLeft - 14

        return (
          <button
            key={`row-grip-${index}`}
            type="button"
            data-row-grip-index={index}
            aria-label={`Row ${index + 1} actions`}
            onPointerDown={handlePointerDown(index)}
            className={cn(
              'absolute z-30 flex size-7 cursor-grab items-center justify-center rounded-sm text-muted-foreground transition-opacity hover:bg-blue-100 hover:text-foreground dark:hover:bg-blue-900/40',
              visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
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
          position={dragInfo.position}
          targetIndex={dragInfo.targetIndex}
          rowEls={rowEls}
          wrapperEl={wrapperEl}
        />
      ) : null}
    </>
  )
}

function DragInsertionLine({
  anchorElem,
  position,
  targetIndex,
  rowEls,
  wrapperEl,
}: {
  anchorElem: HTMLElement
  position: 'before' | 'after'
  targetIndex: number
  rowEls: HTMLTableRowElement[]
  wrapperEl: HTMLElement
}) {
  const anchorRect = anchorElem.getBoundingClientRect()
  const wrapperRect = wrapperEl.getBoundingClientRect()
  const row = rowEls[targetIndex]
  const rowRect = row?.getBoundingClientRect()
  const lineY = rowRect
    ? position === 'after'
      ? rowRect.bottom
      : rowRect.top
    : wrapperRect.bottom
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
