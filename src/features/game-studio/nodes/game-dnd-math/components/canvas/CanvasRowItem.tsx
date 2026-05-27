import { Reorder, useDragControls } from 'motion/react'

import {
  isSigmaCanvasRow,
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
} from '../../types/drag-drop-math.schema'
import { BetweenRowZone } from './BetweenRowZone'
import { CanvasRow } from './CanvasRow'
import { SigmaCanvasRow } from './SigmaCanvasRow'

import type { MathTokenCommitPayload } from '../../hooks/useMathDropNodeEditor'

export type CanvasRowItemProps = {
  row: DragDropMathCanvasRow
  interactionLocked?: boolean
  instantColorFeedback?: boolean
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (tokenId: string, payload: MathTokenCommitPayload) => void
  onTokenRemove: (tokenId: string) => void
  onSigmaRemove: (rowId: string) => void
}

/**
 * One reorderable row. Hosts its own Framer Motion drag controls so the grip
 * button inside {@link CanvasRow} can start the reorder gesture programmatically.
 */
function CanvasRowItemBody({
  row,
  interactionLocked = false,
  instantColorFeedback,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
  onSigmaRemove,
  dragControls,
}: CanvasRowItemProps & { dragControls: ReturnType<typeof useDragControls> }) {
  return (
    <>
      {isSigmaCanvasRow(row) ? (
        <SigmaCanvasRow
          row={row}
          dragControls={dragControls}
          interactionLocked={interactionLocked}
          onRemove={onSigmaRemove}
        />
      ) : isTokenCanvasRow(row) ? (
        <CanvasRow
          row={row}
          dragControls={dragControls}
          interactionLocked={interactionLocked}
          instantColorFeedback={instantColorFeedback}
          onTokenValueChange={onTokenValueChange}
          onMathTokenCommit={onMathTokenCommit}
          onTokenRemove={onTokenRemove}
        />
      ) : null}
      <BetweenRowZone
        position="after"
        rowId={row.id}
        disabled={interactionLocked}
      />
    </>
  )
}

export function CanvasRowItem({
  row,
  interactionLocked = false,
  instantColorFeedback,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
  onSigmaRemove,
}: CanvasRowItemProps) {
  const dragControls = useDragControls()

  if (interactionLocked) {
    return (
      <div className="list-none">
        <CanvasRowItemBody
          row={row}
          interactionLocked
          instantColorFeedback={instantColorFeedback}
          onTokenValueChange={onTokenValueChange}
          onMathTokenCommit={onMathTokenCommit}
          onTokenRemove={onTokenRemove}
          onSigmaRemove={onSigmaRemove}
          dragControls={dragControls}
        />
      </div>
    )
  }

  return (
    <Reorder.Item
      as="div"
      value={row}
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
    >
      <CanvasRowItemBody
        row={row}
        instantColorFeedback={instantColorFeedback}
        onTokenValueChange={onTokenValueChange}
        onMathTokenCommit={onMathTokenCommit}
        onTokenRemove={onTokenRemove}
        onSigmaRemove={onSigmaRemove}
        dragControls={dragControls}
      />
    </Reorder.Item>
  )
}
