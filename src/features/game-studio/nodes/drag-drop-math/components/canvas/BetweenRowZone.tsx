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
  disabled?: boolean
}

export function BetweenRowZone({ position, rowId, disabled = false }: BetweenRowZoneProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: getCanvasGapDropId(position, rowId),
    disabled,
    data: {
      [CANVAS_GAP_DROPPABLE_DATA_KEY]: { position, rowId },
    },
  })

  // Framer row reorder does not set a dnd-kit active payload — gaps stay minimal then.
  // Result-duplicate drags use the same gap affordance; sigma still wins via collision priority.
  const showGapGhost = Boolean(active) && !getCanvasRowSortablePayload(active?.data.current)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative w-full transition-all duration-150',
        !showGapGhost && 'my-0.5 h-1',
        showGapGhost && !isOver && 'my-1.5 h-10',
        showGapGhost && isOver && 'my-1.5 h-14',
      )}
    >
      <RowGhostHint
        isVisible={showGapGhost}
        isOver={isOver}
      />
    </div>
  )
}
