import { useDraggable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

import { DropMathNode, type DropMathNodeProps } from './DropMathNode'
import { DropTextNode, type DropTextNodeProps } from './DropTextNode'
import { MATH_NODE_DRAG_DATA_KEY, type MathNodeDragData } from './drag-drop-math-dnd.types'
import type { MathNodeVariant } from './math-node.types'

type DropNodeSharedProps = {
  dragId: string
  dragData: MathNodeDragData
  variant: MathNodeVariant
  isDragOverlay?: boolean
  className?: string
  disabled?: boolean
}

export type DraggableDropNodeProps = DropNodeSharedProps &
  Omit<DropMathNodeProps, 'className'> &
  Omit<DropTextNodeProps, 'className'>

export function DraggableDropNode({
  dragId,
  dragData,
  variant,
  isDragOverlay = false,
  className,
  disabled = false,
  value,
  onValueChange,
  editAriaLabel,
  onRemove,
}: DraggableDropNodeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    disabled,
    data: { [MATH_NODE_DRAG_DATA_KEY]: dragData },
  })

  const dragSurfaceClassName = cn(
    (isDragging || isDragOverlay) && !disabled && 'cursor-grabbing',
    isDragging && !isDragOverlay && 'opacity-0',
    className,
  )

  const dropNodeProps = {
    value,
    onValueChange,
    disabled,
    editAriaLabel,
    onRemove,
    useGrabCursor: !disabled,
  }

  return (
    <div
      ref={setNodeRef}
      className={dragSurfaceClassName}
      {...(disabled ? {} : { ...listeners, ...attributes })}
    >
      {variant === 'math' ? (
        <DropMathNode {...dropNodeProps} />
      ) : (
        <DropTextNode {...dropNodeProps} />
      )}
    </div>
  )
}
