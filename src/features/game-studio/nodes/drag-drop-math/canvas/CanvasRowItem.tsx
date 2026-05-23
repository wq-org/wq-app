import { Reorder, useDragControls } from 'motion/react'

import type { DragDropMathCanvasRow } from '../drag-drop-math.schema'
import { BetweenRowZone } from './BetweenRowZone'
import { CanvasRow } from './CanvasRow'

export type CanvasRowItemProps = {
  row: DragDropMathCanvasRow
  onTokenValueChange: (tokenId: string, value: string) => void
  onTokenRemove: (tokenId: string) => void
}

/**
 * One reorderable row. Hosts its own Framer Motion drag controls so the grip
 * button inside {@link CanvasRow} can start the reorder gesture programmatically.
 */
export function CanvasRowItem({ row, onTokenValueChange, onTokenRemove }: CanvasRowItemProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      as="div"
      value={row}
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
    >
      <CanvasRow
        row={row}
        dragControls={dragControls}
        onTokenValueChange={onTokenValueChange}
        onTokenRemove={onTokenRemove}
      />
      <BetweenRowZone
        position="after"
        rowId={row.id}
      />
    </Reorder.Item>
  )
}
