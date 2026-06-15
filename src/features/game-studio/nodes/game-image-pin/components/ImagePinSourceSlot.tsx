'use client'

import { useDraggable, useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

import {
  PIN_DRAGGABLE_ID,
  PIN_SOURCE_DROPPABLE_ID,
} from '../constants/imagePinPreviewDnd.constants'
import { ImagePin } from './ImagePin'

export type ImagePinSourceSlotProps = {
  pinAtSource: boolean
  className?: string
}

function DraggablePin() {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: PIN_DRAGGABLE_ID,
  })

  return (
    <ImagePin
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0 : 1 }}
      {...listeners}
      {...attributes}
    />
  )
}

export function ImagePinSourceSlot({ pinAtSource, className }: ImagePinSourceSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: PIN_SOURCE_DROPPABLE_ID })

  return (
    <div className={cn('flex min-w-0', className)}>
      <div
        ref={setNodeRef}
        className={cn(
          'relative flex h-16 w-full min-w-0 items-center justify-center rounded-2xl border transition-shadow',
          isOver && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        )}
      >
        {pinAtSource ? <DraggablePin /> : null}
      </div>
    </div>
  )
}
