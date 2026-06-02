import { Plus } from 'lucide-react'
import type { JSX, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { deleteLastEmptyColumn, smartInsertCol } from './tableInteractionUtils'
import type { LexicalEditor, NodeKey } from 'lexical'

export type AddColButtonProps = {
  editor: LexicalEditor
  tableKey: NodeKey
  anchorElem: HTMLElement
  tableEl: HTMLElement
  visible: boolean
  getColumnCount: () => number
}

const PX_PER_COL = 60
const CORNER_RESERVED_PX = 20

export function AddColButton({
  editor,
  tableKey,
  anchorElem,
  tableEl,
  visible,
  getColumnCount,
}: AddColButtonProps): JSX.Element {
  const dragStateRef = useRef<{
    startX: number
    addedDuringDrag: number
    armed: boolean
  } | null>(null)

  const anchorRect = anchorElem.getBoundingClientRect()
  const tableRect = tableEl.getBoundingClientRect()
  const left = tableRect.right - anchorRect.left + anchorElem.scrollLeft + 4
  const top = tableRect.top - anchorRect.top + anchorElem.scrollTop
  const height = Math.max(0, tableRect.height - CORNER_RESERVED_PX)

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = dragStateRef.current
      if (!state) return
      const deltaX = e.clientX - state.startX
      if (!state.armed && Math.abs(deltaX) < 6) return
      state.armed = true
      const targetAdded = Math.max(0, Math.floor(deltaX / PX_PER_COL))
      while (state.addedDuringDrag < targetAdded) {
        const columnCount = getColumnCount()
        if (columnCount <= 0) {
          break
        }
        smartInsertCol(editor, tableKey, columnCount - 1, 'after')
        state.addedDuringDrag++
      }
      while (state.addedDuringDrag > targetAdded) {
        if (!deleteLastEmptyColumn(editor, tableKey)) {
          break
        }
        state.addedDuringDrag--
      }
    }
    const handleUp = () => {
      const state = dragStateRef.current
      dragStateRef.current = null
      if (state && !state.armed) {
        const columnCount = getColumnCount()
        if (columnCount > 0) {
          smartInsertCol(editor, tableKey, columnCount - 1, 'after')
        }
      }
    }
    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
    return () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
    }
  }, [editor, tableKey, getColumnCount])

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragStateRef.current = {
      startX: e.clientX,
      addedDuringDrag: 0,
      armed: false,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Add column"
          onPointerDown={handlePointerDown}
          className={cn(
            'absolute z-20 flex w-6 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground transition-opacity hover:border-solid hover:bg-accent hover:text-foreground',
            visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          style={{ top, left, height }}
        >
          <Plus className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        Click to add a new column · Drag to add or remove columns
      </TooltipContent>
    </Tooltip>
  )
}
