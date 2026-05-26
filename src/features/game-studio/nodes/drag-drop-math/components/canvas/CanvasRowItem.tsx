import { Reorder, useDragControls } from 'motion/react'

import { isSigmaCanvasRow, type DragDropMathCanvasRow } from '../../types/drag-drop-math.schema'
import { BetweenRowZone } from './BetweenRowZone'
import { CanvasRow } from './CanvasRow'
import { SigmaCanvasRow } from './SigmaCanvasRow'

import type { MathTokenCommitPayload } from '../../hooks/useMathDropNodeEditor'

export type CanvasRowItemProps = {
  row: DragDropMathCanvasRow
  instantColorFeedback?: boolean
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (tokenId: string, payload: MathTokenCommitPayload) => void
  onTokenRemove: (tokenId: string) => void
  onSigmaReset: (rowId: string) => void
}

/**
 * One reorderable row. Hosts its own Framer Motion drag controls so the grip
 * button inside {@link CanvasRow} can start the reorder gesture programmatically.
 */
export function CanvasRowItem({
  row,
  instantColorFeedback,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
  onSigmaReset,
}: CanvasRowItemProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      as="div"
      value={row}
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
    >
      {isSigmaCanvasRow(row) ? (
        <SigmaCanvasRow
          row={row}
          dragControls={dragControls}
          onReset={onSigmaReset}
        />
      ) : (
        <CanvasRow
          row={row}
          dragControls={dragControls}
          instantColorFeedback={instantColorFeedback}
          onTokenValueChange={onTokenValueChange}
          onMathTokenCommit={onMathTokenCommit}
          onTokenRemove={onTokenRemove}
        />
      )}
      <BetweenRowZone
        position="after"
        rowId={row.id}
      />
    </Reorder.Item>
  )
}
