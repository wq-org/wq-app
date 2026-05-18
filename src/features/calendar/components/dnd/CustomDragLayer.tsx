import { useDragLayer } from 'react-dnd'

import type { ReactNode } from 'react'
import type { IEvent } from '../../types/calendar.types'

type IDragItem = {
  event: IEvent
  children: ReactNode
  width: number
  height: number
}

export function CustomDragLayer() {
  const { isDragging, item, currentOffset, initialOffset, initialClientOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem() as IDragItem | null,
      itemType: monitor.getItemType(),
      isDragging: monitor.isDragging(),
      currentOffset: monitor.getClientOffset(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      initialClientOffset: monitor.getInitialClientOffset(),
    }),
  )

  if (!isDragging || !item || !currentOffset || !initialOffset || !initialClientOffset) {
    return null
  }

  const offsetX = initialClientOffset.x - initialOffset.x
  const offsetY = initialClientOffset.y - initialOffset.y

  const layerStyles: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: currentOffset.x - offsetX,
    top: currentOffset.y - offsetY,
  }

  return (
    <div style={layerStyles}>
      <div style={{ width: item.width, height: item.height }}>{item.children}</div>
    </div>
  )
}
