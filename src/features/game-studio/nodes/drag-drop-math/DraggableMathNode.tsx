import { useDraggable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

import { MathNode, type MathNodeProps } from './MathNode'
import { MATH_NODE_DRAG_DATA_KEY, type MathNodeDragData } from './drag-drop-math-dnd.types'

export type DraggableMathNodeProps = MathNodeProps & {
  dragId: string
  dragData: MathNodeDragData
  /** When true, used inside {@link DragOverlay} (no hide-while-dragging). */
  isDragOverlay?: boolean
  className?: string
}

export function DraggableMathNode({
  dragId,
  dragData,
  isDragOverlay = false,
  className,
  ...mathNodeProps
}: DraggableMathNodeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { [MATH_NODE_DRAG_DATA_KEY]: dragData },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'touch-none cursor-grab active:cursor-grabbing',
        (isDragging || isDragOverlay) && 'cursor-grabbing',
        isDragging && !isDragOverlay && 'opacity-0',
        className,
      )}
      {...listeners}
      {...attributes}
    >
      <MathNode
        {...mathNodeProps}
        useGrabCursor
      />
    </div>
  )
}
