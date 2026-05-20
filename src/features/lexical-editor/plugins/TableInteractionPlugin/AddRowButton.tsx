import { Plus } from 'lucide-react'
import type { JSX, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { deleteLastEmptyRow, smartInsertRow } from './tableInteractionUtils'
import type { LexicalEditor, NodeKey } from 'lexical'

export type AddRowButtonProps = {
  editor: LexicalEditor
  tableKey: NodeKey
  anchorElem: HTMLElement
  tableEl: HTMLElement
  visible: boolean
  getLastRowKey: () => NodeKey | null
}

const PX_PER_ROW = 40

export function AddRowButton({
  editor,
  tableKey,
  anchorElem,
  tableEl,
  visible,
  getLastRowKey,
}: AddRowButtonProps): JSX.Element {
  const dragStateRef = useRef<{
    startY: number
    addedDuringDrag: number
    armed: boolean
  } | null>(null)

  const anchorRect = anchorElem.getBoundingClientRect()
  const tableRect = tableEl.getBoundingClientRect()
  const top = tableRect.bottom - anchorRect.top + anchorElem.scrollTop + 4
  const left = tableRect.left - anchorRect.left + anchorElem.scrollLeft
  const width = tableRect.width

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = dragStateRef.current
      if (!state) return
      const deltaY = e.clientY - state.startY
      if (!state.armed && Math.abs(deltaY) < 6) return
      state.armed = true
      const targetAdded = Math.max(0, Math.floor(deltaY / PX_PER_ROW))
      while (state.addedDuringDrag < targetAdded) {
        const lastRowKey = getLastRowKey()
        if (!lastRowKey) {
          break
        }
        smartInsertRow(editor, tableKey, lastRowKey, 'after')
        state.addedDuringDrag++
      }
      while (state.addedDuringDrag > targetAdded) {
        if (!deleteLastEmptyRow(editor, tableKey)) {
          break
        }
        state.addedDuringDrag--
      }
    }
    const handleUp = () => {
      const state = dragStateRef.current
      dragStateRef.current = null
      if (state && !state.armed) {
        const lastRowKey = getLastRowKey()
        if (lastRowKey) {
          smartInsertRow(editor, tableKey, lastRowKey, 'after')
        }
      }
    }
    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
    return () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
    }
  }, [editor, tableKey, getLastRowKey])

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragStateRef.current = {
      startY: e.clientY,
      addedDuringDrag: 0,
      armed: false,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Add row"
          onPointerDown={handlePointerDown}
          className={cn(
            'absolute z-20 flex h-6 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground transition-opacity hover:border-solid hover:bg-accent hover:text-foreground',
            visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          style={{ top, left, width }}
        >
          <Plus className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Click to add a new row · Drag to add or remove rows
      </TooltipContent>
    </Tooltip>
  )
}
