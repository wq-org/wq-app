import { Reorder } from 'motion/react'

import type { DragDropMathCanvasRow } from '../../types/drag-drop-math.schema'
import type { MathTokenCommitPayload } from '../../hooks/useMathDropNodeEditor'
import { BetweenRowZone } from './BetweenRowZone'
import { CanvasRowItem } from './CanvasRowItem'

export type CanvasRowListProps = {
  rows: readonly DragDropMathCanvasRow[]
  instantColorFeedback?: boolean
  onRowsReorder: (nextRows: DragDropMathCanvasRow[]) => void
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (tokenId: string, payload: MathTokenCommitPayload) => void
  onTokenRemove: (tokenId: string) => void
  onSigmaReset: (rowId: string) => void
}

/**
 * Vertical list of canvas rows. Row order is animated by Framer Motion's
 * {@link Reorder.Group}; token drops still flow through dnd-kit on the row body
 * and the {@link BetweenRowZone} drop targets.
 */
export function CanvasRowList({
  rows,
  instantColorFeedback,
  onRowsReorder,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
  onSigmaReset,
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
            instantColorFeedback={instantColorFeedback}
            onTokenValueChange={onTokenValueChange}
            onMathTokenCommit={onMathTokenCommit}
            onTokenRemove={onTokenRemove}
            onSigmaReset={onSigmaReset}
          />
        ))}
      </Reorder.Group>
    </div>
  )
}
