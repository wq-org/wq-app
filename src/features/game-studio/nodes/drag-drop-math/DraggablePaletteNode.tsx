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

  const variantOutlineClassName =
    dragData.variant === 'math' ? 'outline-blue-400/70' : 'outline-muted-foreground/50'

  return (
    <div
      ref={setNodeRef}
      data-dragging={isDragging ? 'true' : 'false'}
      className={cn(
        'touch-none cursor-grab rounded-full transition-[outline-color,opacity] duration-150 active:cursor-grabbing',
        // Keep the source chip in place (just dimmed slightly) and outline it in
        // the dragged variant's accent color so authors see what's being moved.
        isDragging && [
          'cursor-grabbing opacity-60',
          'outline-2 outline-dashed outline-offset-4',
          variantOutlineClassName,
        ],
        className,
      )}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}
