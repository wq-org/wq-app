import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { DragDropMathCanvasRow } from '../drag-drop-math.schema'
import type { MathTokenCommitPayload } from '../useMathDropNodeEditor'
import { CANVAS_EMPTY_DROP_ID } from './canvas-dnd.constants'
import { CanvasRowList } from './CanvasRowList'

export type DragDropMathCanvasProps = {
  rows: readonly DragDropMathCanvasRow[]
  onRowsReorder: (nextRows: DragDropMathCanvasRow[]) => void
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (equationTokenId: string, payload: MathTokenCommitPayload) => void
  onTokenRemove: (tokenId: string) => void
}

export function DragDropMathCanvas({
  rows,
  onRowsReorder,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
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
            ? 'min-h-[160px] px-5 py-4'
            : 'min-h-0 px-4 py-3',
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
          onRowsReorder={onRowsReorder}
          onTokenValueChange={onTokenValueChange}
          onMathTokenCommit={onMathTokenCommit}
          onTokenRemove={onTokenRemove}
        />
      )}
    </div>
  )
}
