import { useDndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import type { DragControls } from 'motion/react'
import { GripVertical } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { getMathNodeDragData } from '../drag-drop-math-dnd.types'
import type { DragDropMathCanvasRow } from '../drag-drop-math.schema'
import type { MathNodeVariant } from '../math-node.types'
import { CanvasRowNode } from './CanvasRowNode'
import { CANVAS_ROW_MAX_TOKENS } from './canvasDropTarget.utils'
import { getCanvasRowSortableId, getCanvasTokenSortableId } from './canvas-dnd.constants'
import { CANVAS_ROW_SORTABLE_DATA_KEY, getCanvasTokenSortablePayload } from './canvas.types'

type ActiveCanvasDrag = {
  variant: MathNodeVariant
  /** null when the active drag originates from the palette. */
  sourceRowId: string | null
}

export type CanvasRowProps = {
  row: DragDropMathCanvasRow
  /** Framer Motion drag controls owned by the wrapping Reorder.Item. */
  dragControls: DragControls
  onTokenValueChange: (tokenId: string, value: string) => void
  onTokenRemove: (tokenId: string) => void
}

/**
 * One canvas row. The row body is a dnd-kit drop target for cross-row token moves;
 * row order itself is owned by the parent Reorder.Item via {@link dragControls}.
 */
export function CanvasRow({
  row,
  dragControls,
  onTokenValueChange,
  onTokenRemove,
}: CanvasRowProps) {
  const { t } = useTranslation('features.gameStudio')

  const { setNodeRef, isOver } = useDroppable({
    id: getCanvasRowSortableId(row.id),
    data: {
      [CANVAS_ROW_SORTABLE_DATA_KEY]: { rowId: row.id },
    },
  })

  const { active } = useDndContext()

  const activeDrag = useMemo<ActiveCanvasDrag | null>(() => {
    if (!active) return null
    const paletteData = getMathNodeDragData(active.data.current)
    if (paletteData) {
      return { variant: paletteData.variant, sourceRowId: null }
    }
    const tokenPayload = getCanvasTokenSortablePayload(active.data.current)
    if (tokenPayload) {
      return { variant: tokenPayload.variant, sourceRowId: tokenPayload.rowId }
    }
    return null
  }, [active])

  // A drop into this row creates a new row (instead of landing inline) when
  // the dragged variant doesn't match this row, or the row already holds the
  // maximum number of tokens. Same-row reorders are always allowed.
  const wouldRejectInline = useMemo(() => {
    if (!activeDrag) return false
    if (activeDrag.sourceRowId === row.id) return false
    if (activeDrag.variant !== row.variant) return true
    return row.tokens.length >= CANVAS_ROW_MAX_TOKENS
  }, [activeDrag, row.id, row.tokens.length, row.variant])

  const showRejectFeedback = isOver && wouldRejectInline
  const showAcceptFeedback = isOver && !wouldRejectInline

  const tokenSortableIds = row.tokens.map((token) => getCanvasTokenSortableId(token.id))

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group/canvas-row relative flex w-full items-start gap-2 rounded-md px-2 py-3',
        'min-h-14 border-2 border-dashed border-transparent transition-colors duration-150',
        showAcceptFeedback && 'border-blue-400/60 bg-blue-500/10',
        showRejectFeedback && 'border-red-500/70 bg-red-500/10',
      )}
    >
      <button
        type="button"
        aria-label={t('dragDropMathEditor.reorderRowAriaLabel')}
        className={cn(
          'mt-1 flex h-7 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/60',
          'opacity-0 transition-opacity duration-150',
          'group-hover/canvas-row:opacity-100 focus-visible:opacity-100',
          'cursor-grab touch-none hover:text-foreground active:cursor-grabbing',
        )}
        onPointerDown={(event) => {
          event.stopPropagation()
          dragControls.start(event)
        }}
      >
        <GripVertical
          className="h-4 w-4"
          aria-hidden
        />
      </button>
      <SortableContext
        items={tokenSortableIds}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex min-h-12 min-w-0 flex-1 flex-wrap content-start items-center gap-2">
          {row.tokens.map((token) => (
            <CanvasRowNode
              key={token.id}
              rowId={row.id}
              token={token}
              onValueChange={onTokenValueChange}
              onRemove={onTokenRemove}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
