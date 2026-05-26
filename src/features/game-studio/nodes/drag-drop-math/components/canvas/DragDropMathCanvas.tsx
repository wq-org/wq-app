import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { DragDropMathCanvasRow } from '../../types/drag-drop-math.schema'
import type { MathTokenCommitPayload } from '../../hooks/useMathDropNodeEditor'
import { CANVAS_EMPTY_DROP_ID } from '../../constants/canvas-dnd.constants'
import { CanvasRowList } from './CanvasRowList'

export type DragDropMathCanvasProps = {
  rows: readonly DragDropMathCanvasRow[]
  instantColorFeedback?: boolean
  onRowsReorder: (nextRows: DragDropMathCanvasRow[]) => void
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (equationTokenId: string, payload: MathTokenCommitPayload) => void
  onTokenRemove: (tokenId: string) => void
  onSigmaReset: (rowId: string) => void
}

export function DragDropMathCanvas({
  rows,
  instantColorFeedback,
  onRowsReorder,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
  onSigmaReset,
}: DragDropMathCanvasProps) {
  const { t } = useTranslation('features.gameStudio')
  const { active } = useDndContext()
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_EMPTY_DROP_ID })
  const isEmpty = rows.length === 0
  const isDragSession = active != null

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative w-full rounded-2xl border border-dashed border-border/70 bg-secondary/30 transition-[min-height,padding,box-shadow] duration-150',
        isEmpty
          ? 'min-h-[200px] px-6 py-5'
          : isDragSession
            ? 'min-h-[160px] px-5 pt-4 pb-8'
            : 'min-h-0 px-4 pt-3 pb-8',
        isEmpty && isOver && 'ring-2 ring-blue-500/40 ring-offset-2 ring-offset-background',
      )}
    >
      {isEmpty ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
          {t('dragDropMathEditor.canvasEmptyHint')}
        </p>
      ) : (
        <CanvasRowList
          rows={rows}
          instantColorFeedback={instantColorFeedback}
          onRowsReorder={onRowsReorder}
          onTokenValueChange={onTokenValueChange}
          onMathTokenCommit={onMathTokenCommit}
          onTokenRemove={onTokenRemove}
          onSigmaReset={onSigmaReset}
        />
      )}
    </div>
  )
}
