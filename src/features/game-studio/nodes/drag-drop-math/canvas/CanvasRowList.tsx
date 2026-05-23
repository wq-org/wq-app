import { Fragment } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import type { DragDropMathCanvasRow } from '../drag-drop-math.schema'
import { BetweenRowZone } from './BetweenRowZone'
import { CanvasRow } from './CanvasRow'
import { getCanvasRowSortableId } from './canvas-dnd.constants'

export type CanvasRowListProps = {
  rows: readonly DragDropMathCanvasRow[]
  onTokenValueChange: (tokenId: string, value: string) => void
  onTokenRemove: (tokenId: string) => void
}

export function CanvasRowList({ rows, onTokenValueChange, onTokenRemove }: CanvasRowListProps) {
  const rowSortableIds = rows.map((row) => getCanvasRowSortableId(row.id))

  return (
    <SortableContext
      items={rowSortableIds}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex w-full flex-col">
        {rows.map((row, index) => (
          <Fragment key={row.id}>
            {index === 0 ? (
              <BetweenRowZone
                position="before"
                rowId={row.id}
              />
            ) : null}
            <CanvasRow
              row={row}
              onTokenValueChange={onTokenValueChange}
              onTokenRemove={onTokenRemove}
            />
            <BetweenRowZone
              position="after"
              rowId={row.id}
            />
          </Fragment>
        ))}
      </div>
    </SortableContext>
  )
}
