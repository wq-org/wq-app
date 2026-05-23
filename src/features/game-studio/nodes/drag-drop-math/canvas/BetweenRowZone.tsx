import { useDroppable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

import { getCanvasGapDropId } from './canvas-dnd.constants'
import { CANVAS_GAP_DROPPABLE_DATA_KEY, getCanvasRowSortablePayload } from './canvas.types'
import { RowGhostHint } from './RowGhostHint'

export type BetweenRowZoneProps = {
  position: 'before' | 'after'
  rowId: string
}

export function BetweenRowZone({ position, rowId }: BetweenRowZoneProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: getCanvasGapDropId(position, rowId),
    data: {
      [CANVAS_GAP_DROPPABLE_DATA_KEY]: { position, rowId },
    },
  })

  // Row reorder drags should not surface gap targets; only palette / canvas tokens do.
  const isTokenLikeDrag = Boolean(active) && !getCanvasRowSortablePayload(active?.data.current)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative w-full transition-all duration-150',
        !isTokenLikeDrag && 'my-1 h-3',
        isTokenLikeDrag && !isOver && 'my-2 h-12',
        isTokenLikeDrag && isOver && 'my-2 h-16',
      )}
    >
      <RowGhostHint
        isVisible={isTokenLikeDrag}
        isOver={isOver}
      />
    </div>
  )
}
