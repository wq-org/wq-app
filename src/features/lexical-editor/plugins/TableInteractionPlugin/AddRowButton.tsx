import { Plus } from 'lucide-react'
import type { JSX } from 'react'
import { useEffect, useRef } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { appendRow, deleteRow } from './tableActions'
import type { LexicalEditor, NodeKey } from 'lexical'

export type AddRowButtonProps = {
  editor: LexicalEditor
  tableKey: NodeKey
  anchorElem: HTMLElement
  wrapperEl: HTMLElement
  visible: boolean
  getRowCount: () => number
}

const PX_PER_ROW = 40

export function AddRowButton({
  editor,
  tableKey,
  anchorElem,
  wrapperEl,
  visible,
  getRowCount,
}: AddRowButtonProps): JSX.Element {
  const dragStateRef = useRef<{
    startY: number
    initialCount: number
    addedDuringDrag: number
    armed: boolean
  } | null>(null)

  const anchorRect = anchorElem.getBoundingClientRect()
  const wrapperRect = wrapperEl.getBoundingClientRect()
  const top = wrapperRect.bottom - anchorRect.top + anchorElem.scrollTop + 4
  const left = wrapperRect.left - anchorRect.left + anchorElem.scrollLeft
  const width = wrapperRect.width

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const state = dragStateRef.current
      if (!state) return
      const deltaY = e.clientY - state.startY
      if (!state.armed && Math.abs(deltaY) < 6) return
      state.armed = true
      const targetAdded = Math.max(0, Math.floor(deltaY / PX_PER_ROW))
      while (state.addedDuringDrag < targetAdded) {
        appendRow(editor, tableKey)
        state.addedDuringDrag++
      }
      while (state.addedDuringDrag > targetAdded) {
        const totalRows = getRowCount()
        deleteRow(editor, tableKey, totalRows - 1)
        state.addedDuringDrag--
      }
    }
    const handleUp = () => {
      const state = dragStateRef.current
      dragStateRef.current = null
      if (state && !state.armed) {
        appendRow(editor, tableKey)
      }
    }
    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
    return () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
    }
  }, [editor, tableKey, getRowCount])

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragStateRef.current = {
      startY: e.clientY,
      initialCount: getRowCount(),
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
