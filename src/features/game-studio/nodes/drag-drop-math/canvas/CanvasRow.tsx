import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { DragDropMathCanvasRow } from '../drag-drop-math.schema'
import { CanvasRowNode } from './CanvasRowNode'
import { getCanvasRowSortableId, getCanvasTokenSortableId } from './canvas-dnd.constants'
import { CANVAS_ROW_SORTABLE_DATA_KEY } from './canvas.types'

export type CanvasRowProps = {
  row: DragDropMathCanvasRow
  onTokenValueChange: (tokenId: string, value: string) => void
  onTokenRemove: (tokenId: string) => void
}

export function CanvasRow({ row, onTokenValueChange, onTokenRemove }: CanvasRowProps) {
  const { t } = useTranslation('features.gameStudio')

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: getCanvasRowSortableId(row.id),
    data: {
      [CANVAS_ROW_SORTABLE_DATA_KEY]: { rowId: row.id },
    },
  })

  const tokenSortableIds = row.tokens.map((token) => getCanvasTokenSortableId(token.id))

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group/canvas-row relative flex w-full items-start gap-2 rounded-md px-1 py-1.5',
        'transition-colors',
        isOver && 'bg-blue-500/5',
        isDragging && 'opacity-50',
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={t('dragDropMathEditor.reorderRowAriaLabel')}
        className={cn(
          'mt-1 flex h-7 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/60',
          'opacity-0 transition-opacity duration-150',
          'group-hover/canvas-row:opacity-100 focus-visible:opacity-100',
          'cursor-grab hover:text-foreground active:cursor-grabbing',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical
          className="h-4 w-4"
          aria-hidden
        />
      </button>
      <SortableContext
        items={tokenSortableIds}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex min-h-10 min-w-0 flex-1 flex-wrap content-start items-center gap-2">
          {row.tokens.map((token) => (
            <CanvasRowNode
              key={token.id}
              rowId={row.id}
              token={token}
              onValueChange={onTokenValueChange}
              onRemove={onTokenRemove}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
