import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { DragDropMathCanvasRow } from '../../types/drag-drop-math.schema'
import type { MathTokenCommitPayload } from '../../hooks/useMathDropNodeEditor'
import {
  CANVAS_EMPTY_DROP_ID,
  DND_MATH_CANVAS_EMPTY_MIN_HEIGHT_CLASS,
} from '../../constants/canvas-dnd.constants'
import { CanvasRowList } from './CanvasRowList'

export type DnDMathCanvasProps = {
  rows: readonly DragDropMathCanvasRow[]
  /** When true, canvas rows, chips, palette, and sigma drops are frozen (preview submit lock). */
  interactionLocked?: boolean
  instantColorFeedback?: boolean
  onRowsReorder: (nextRows: DragDropMathCanvasRow[]) => void
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (equationTokenId: string, payload: MathTokenCommitPayload) => void
  onTokenRemove: (tokenId: string) => void
  onSigmaRemove: (rowId: string) => void
  /** When true, omits outer shell — for use inside {@link DnDMathCanvasPanel}. */
  embedded?: boolean
}

export function DnDMathCanvas({
  rows,
  interactionLocked = false,
  instantColorFeedback,
  onRowsReorder,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
  onSigmaRemove,
  embedded = false,
}: DnDMathCanvasProps) {
  const { t } = useTranslation('features.gameStudio')
  const { active } = useDndContext()
  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_EMPTY_DROP_ID,
    disabled: interactionLocked,
  })
  const isEmpty = rows.length === 0
  const isDragSession = active != null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative w-full transition-[min-height,padding,box-shadow] duration-150',
        embedded
          ? 'min-h-0 bg-transparent px-4 py-2'
          : 'rounded-2xl border border-dashed border-border/70 bg-secondary/30',
        !embedded &&
          (isEmpty
            ? `${DND_MATH_CANVAS_EMPTY_MIN_HEIGHT_CLASS} px-6 py-5`
            : isDragSession
              ? 'min-h-[88px] px-5 pt-4 pb-8'
              : 'min-h-0 px-4 pt-3 pb-8'),
        embedded &&
          (isEmpty
            ? DND_MATH_CANVAS_EMPTY_MIN_HEIGHT_CLASS
            : isDragSession
              ? 'min-h-[88px] pb-4'
              : 'min-h-0 pb-4'),
        isEmpty &&
          isOver &&
          !embedded &&
          'ring-2 ring-blue-500/40 ring-offset-2 ring-offset-background',
        isEmpty && isOver && embedded && 'ring-2 ring-inset ring-blue-500/40',
      )}
    >
      {isEmpty ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
          {t('dragDropMathEditor.canvasEmptyHint')}
        </p>
      ) : (
        <CanvasRowList
          rows={rows}
          interactionLocked={interactionLocked}
          instantColorFeedback={instantColorFeedback}
          onRowsReorder={onRowsReorder}
          onTokenValueChange={onTokenValueChange}
          onMathTokenCommit={onMathTokenCommit}
          onTokenRemove={onTokenRemove}
          onSigmaRemove={onSigmaRemove}
        />
      )}
    </div>
  )
}
