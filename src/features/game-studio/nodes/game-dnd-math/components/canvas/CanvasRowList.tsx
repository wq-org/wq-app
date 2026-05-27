import { Reorder } from 'motion/react'

import type { DragDropMathCanvasRow } from '../../types/drag-drop-math.schema'
import type { MathTokenCommitPayload } from '../../hooks/useMathDropNodeEditor'
import { BetweenRowZone } from './BetweenRowZone'
import { CanvasRowItem } from './CanvasRowItem'

export type CanvasRowListProps = {
  rows: readonly DragDropMathCanvasRow[]
  interactionLocked?: boolean
  instantColorFeedback?: boolean
  onRowsReorder: (nextRows: DragDropMathCanvasRow[]) => void
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (tokenId: string, payload: MathTokenCommitPayload) => void
  onTokenRemove: (tokenId: string) => void
  onSigmaRemove: (rowId: string) => void
}

/**
 * Vertical list of canvas rows. Row order is animated by Framer Motion's
 * {@link Reorder.Group}; token drops still flow through dnd-kit on the row body
 * and the {@link BetweenRowZone} drop targets.
 */
function CanvasRowListContent({
  rows,
  interactionLocked = false,
  instantColorFeedback,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
  onSigmaRemove,
}: CanvasRowListProps) {
  return (
    <>
      {rows.map((row) => (
        <CanvasRowItem
          key={row.id}
          row={row}
          interactionLocked={interactionLocked}
          instantColorFeedback={instantColorFeedback}
          onTokenValueChange={onTokenValueChange}
          onMathTokenCommit={onMathTokenCommit}
          onTokenRemove={onTokenRemove}
          onSigmaRemove={onSigmaRemove}
        />
      ))}
    </>
  )
}

export function CanvasRowList({
  rows,
  interactionLocked = false,
  instantColorFeedback,
  onRowsReorder,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
  onSigmaRemove,
}: CanvasRowListProps) {
  return (
    <div className="flex w-full flex-col">
      {rows.length > 0 ? (
        <BetweenRowZone
          position="before"
          rowId={rows[0].id}
          disabled={interactionLocked}
        />
      ) : null}

      {interactionLocked ? (
        <div className="flex w-full flex-col">
          <CanvasRowListContent
            rows={rows}
            interactionLocked
            instantColorFeedback={instantColorFeedback}
            onRowsReorder={onRowsReorder}
            onTokenValueChange={onTokenValueChange}
            onMathTokenCommit={onMathTokenCommit}
            onTokenRemove={onTokenRemove}
            onSigmaRemove={onSigmaRemove}
          />
        </div>
      ) : (
        <Reorder.Group
          as="div"
          axis="y"
          values={[...rows]}
          onReorder={onRowsReorder}
          className="flex w-full flex-col"
        >
          <CanvasRowListContent
            rows={rows}
            instantColorFeedback={instantColorFeedback}
            onRowsReorder={onRowsReorder}
            onTokenValueChange={onTokenValueChange}
            onMathTokenCommit={onMathTokenCommit}
            onTokenRemove={onTokenRemove}
            onSigmaRemove={onSigmaRemove}
          />
        </Reorder.Group>
      )}
    </div>
  )
}
