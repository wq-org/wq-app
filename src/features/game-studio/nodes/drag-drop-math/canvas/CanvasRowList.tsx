import { Reorder } from 'motion/react'

import type { DragDropMathCanvasRow } from '../drag-drop-math.schema'
import { BetweenRowZone } from './BetweenRowZone'
import { CanvasRowItem } from './CanvasRowItem'

export type CanvasRowListProps = {
  rows: readonly DragDropMathCanvasRow[]
  onRowsReorder: (nextRows: DragDropMathCanvasRow[]) => void
  onTokenValueChange: (tokenId: string, value: string) => void
  onTokenRemove: (tokenId: string) => void
}

/**
 * Vertical list of canvas rows. Row order is animated by Framer Motion's
 * {@link Reorder.Group}; token drops still flow through dnd-kit on the row body
 * and the {@link BetweenRowZone} drop targets.
 */
export function CanvasRowList({
  rows,
  onRowsReorder,
  onTokenValueChange,
  onTokenRemove,
}: CanvasRowListProps) {
  return (
    <div className="flex w-full flex-col">
      {rows.length > 0 ? (
        <BetweenRowZone
          position="before"
          rowId={rows[0].id}
        />
      ) : null}

      <Reorder.Group
        as="div"
        axis="y"
        values={[...rows]}
        onReorder={onRowsReorder}
        className="flex w-full flex-col"
      >
        {rows.map((row) => (
          <CanvasRowItem
            key={row.id}
            row={row}
            onTokenValueChange={onTokenValueChange}
            onTokenRemove={onTokenRemove}
          />
        ))}
      </Reorder.Group>
    </div>
  )
}
