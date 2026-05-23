import { useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { DragDropMathCanvasRow } from '../drag-drop-math.schema'
import { CANVAS_EMPTY_DROP_ID } from './canvas-dnd.constants'
import { CanvasRowList } from './CanvasRowList'

export type DragDropMathCanvasProps = {
  rows: readonly DragDropMathCanvasRow[]
  onRowsReorder: (nextRows: DragDropMathCanvasRow[]) => void
  onTokenValueChange: (tokenId: string, value: string) => void
  onTokenRemove: (tokenId: string) => void
}

export function DragDropMathCanvas({
  rows,
  onRowsReorder,
  onTokenValueChange,
  onTokenRemove,
}: DragDropMathCanvasProps) {
  const { t } = useTranslation('features.gameStudio')
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_EMPTY_DROP_ID })
  const isEmpty = rows.length === 0

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative min-h-[200px] w-full rounded-2xl border border-dashed px-6 py-5',
        'border-border/70 bg-secondary/30 transition-shadow',
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
          onTokenRemove={onTokenRemove}
        />
      )}
    </div>
  )
}
