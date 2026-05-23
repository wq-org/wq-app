import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { DropMathNode } from '../DropMathNode'
import { DropTextNode } from '../DropTextNode'
import type { DragDropMathCanvasToken } from '../drag-drop-math.schema'
import { getCanvasTokenSortableId } from './canvas-dnd.constants'
import { CANVAS_TOKEN_SORTABLE_DATA_KEY } from './canvas.types'

export type CanvasRowNodeProps = {
  rowId: string
  token: DragDropMathCanvasToken
  onValueChange: (tokenId: string, value: string) => void
  onRemove: (tokenId: string) => void
}

export function CanvasRowNode({ rowId, token, onValueChange, onRemove }: CanvasRowNodeProps) {
  const { t } = useTranslation('features.gameStudio')

  const editAriaLabel =
    token.variant === 'math'
      ? t('dragDropMathEditor.editMathTokenAriaLabel')
      : t('dragDropMathEditor.editTextTokenAriaLabel')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: getCanvasTokenSortableId(token.id),
    disabled: token.disabled,
    data: {
      [CANVAS_TOKEN_SORTABLE_DATA_KEY]: { rowId, tokenId: token.id },
    },
  })

  const dragSurfaceClassName = cn(
    'max-w-full shrink-0 touch-none',
    !token.disabled && 'cursor-grab active:cursor-grabbing',
    isDragging && 'opacity-0',
  )

  const dropNodeProps = {
    value: token.value,
    onValueChange: (next: string) => onValueChange(token.id, next),
    onRemove: () => onRemove(token.id),
    disabled: token.disabled,
    editAriaLabel,
    useGrabCursor: !token.disabled,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={dragSurfaceClassName}
      {...(token.disabled ? {} : { ...attributes, ...listeners })}
    >
      {token.variant === 'math' ? (
        <DropMathNode {...dropNodeProps} />
      ) : (
        <DropTextNode {...dropNodeProps} />
      )}
    </div>
  )
}
