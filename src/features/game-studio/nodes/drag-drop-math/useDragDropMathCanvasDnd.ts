import { useCallback } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'

import { DRAG_DROP_MATH_CANVAS_DROP_ID } from './drag-drop-math-dnd.constants'
import { getMathNodeDragData } from './drag-drop-math-dnd.types'
import type { DragDropMathCanvasToken } from './drag-drop-math.schema'
import type { MathNodeVariant } from './math-node.types'
import { createCanvasTokenId, getCanvasPlacementFromDragEnd } from './dragDropMathCanvas.utils'

export type UseDragDropMathCanvasDndArgs = {
  tokens: readonly DragDropMathCanvasToken[]
  onTokensChange: (tokens: DragDropMathCanvasToken[]) => void
  resolveDropValue: (variant: MathNodeVariant, value: string) => string
}

export function useDragDropMathCanvasDnd({
  tokens,
  onTokensChange,
  resolveDropValue,
}: UseDragDropMathCanvasDndArgs) {
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.over?.id !== DRAG_DROP_MATH_CANVAS_DROP_ID) return

      const dragData = getMathNodeDragData(event.active.data.current)
      const placement = getCanvasPlacementFromDragEnd(event)
      if (!dragData || !placement) return

      if (dragData.source === 'palette') {
        onTokensChange([
          ...tokens,
          {
            id: createCanvasTokenId(),
            value: resolveDropValue(dragData.variant, dragData.value),
            variant: dragData.variant,
            x: placement.x,
            y: placement.y,
          },
        ])
        return
      }

      onTokensChange(
        tokens.map((token) =>
          token.id === dragData.tokenId ? { ...token, x: placement.x, y: placement.y } : token,
        ),
      )
    },
    [onTokensChange, resolveDropValue, tokens],
  )

  return { handleDragEnd }
}
