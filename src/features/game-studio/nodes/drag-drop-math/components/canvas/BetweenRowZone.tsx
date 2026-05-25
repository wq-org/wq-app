import { useDroppable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

import { getCanvasGapDropId } from '../../constants/canvas-dnd.constants'
import {
  CANVAS_GAP_DROPPABLE_DATA_KEY,
  getCanvasRowSortablePayload,
} from '../../types/canvas.types'
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
        !isTokenLikeDrag && 'my-0.5 h-1',
        isTokenLikeDrag && !isOver && 'my-1.5 h-10',
        isTokenLikeDrag && isOver && 'my-1.5 h-14',
      )}
    >
      <RowGhostHint
        isVisible={isTokenLikeDrag}
        isOver={isOver}
      />
    </div>
  )
}
