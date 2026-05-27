import { useDraggable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import {
  MATH_NODE_DRAG_DATA_KEY,
  type MathNodePaletteDragData,
} from '../types/drag-drop-math-dnd.types'

export type DraggablePaletteNodeProps = {
  dragId: string
  dragData: MathNodePaletteDragData
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function DraggablePaletteNode({
  dragId,
  dragData,
  children,
  className,
  disabled = false,
}: DraggablePaletteNodeProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    disabled,
    data: { [MATH_NODE_DRAG_DATA_KEY]: dragData },
  })

  const variantOutlineClassName =
    dragData.variant === 'math' ? 'outline-blue-400/70' : 'outline-muted-foreground/50'

  return (
    <div
      ref={setNodeRef}
      data-dragging={isDragging ? 'true' : 'false'}
      className={cn(
        'touch-none rounded-full transition-[outline-color,opacity] duration-150',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing',
        // Keep the source chip in place (just dimmed slightly) and outline it in
        // the dragged variant's accent color so authors see what's being moved.
        isDragging && [
          'cursor-grabbing opacity-60',
          'outline-2 outline-dashed outline-offset-4',
          variantOutlineClassName,
        ],
        className,
      )}
      {...(disabled ? {} : { ...listeners, ...attributes })}
    >
      {children}
    </div>
  )
}
