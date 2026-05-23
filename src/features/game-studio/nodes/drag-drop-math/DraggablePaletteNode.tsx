import { useDraggable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { MATH_NODE_DRAG_DATA_KEY, type MathNodePaletteDragData } from './drag-drop-math-dnd.types'

export type DraggablePaletteNodeProps = {
  dragId: string
  dragData: MathNodePaletteDragData
  children: ReactNode
  className?: string
}

export function DraggablePaletteNode({
  dragId,
  dragData,
  children,
  className,
}: DraggablePaletteNodeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { [MATH_NODE_DRAG_DATA_KEY]: dragData },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'touch-none cursor-grab active:cursor-grabbing',
        isDragging && 'cursor-grabbing opacity-0',
        className,
      )}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}
