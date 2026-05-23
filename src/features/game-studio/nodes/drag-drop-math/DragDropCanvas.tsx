import { useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { DraggableDropNode } from './DraggableDropNode'
import {
  DRAG_DROP_MATH_CANVAS_DROP_ID,
  getMathNodeCanvasDragId,
} from './drag-drop-math-dnd.constants'
import type { DragDropMathCanvasToken } from './drag-drop-math.schema'

export type DragDropCanvasProps = {
  tokens: readonly DragDropMathCanvasToken[]
  onTokenValueChange: (tokenId: string, value: string) => void
  onTokenRemove: (tokenId: string) => void
}

function PositionedCanvasToken({
  token,
  onTokenValueChange,
  onTokenRemove,
}: {
  token: DragDropMathCanvasToken
  onTokenValueChange: (tokenId: string, value: string) => void
  onTokenRemove: (tokenId: string) => void
}) {
  const { t } = useTranslation('features.gameStudio')
  const editAriaLabel =
    token.variant === 'math'
      ? t('dragDropMathEditor.editMathTokenAriaLabel')
      : t('dragDropMathEditor.editTextTokenAriaLabel')

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${token.x * 100}%`,
        top: `${token.y * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <DraggableDropNode
        dragId={getMathNodeCanvasDragId(token.id)}
        dragData={{ source: 'canvas', tokenId: token.id }}
        variant={token.variant}
        value={token.value}
        onValueChange={(next) => onTokenValueChange(token.id, next)}
        onRemove={() => onTokenRemove(token.id)}
        disabled={token.disabled}
        editAriaLabel={editAriaLabel}
      />
    </div>
  )
}

export function DragDropCanvas({ tokens, onTokenValueChange, onTokenRemove }: DragDropCanvasProps) {
  const { t } = useTranslation('features.gameStudio')
  const { setNodeRef, isOver } = useDroppable({ id: DRAG_DROP_MATH_CANVAS_DROP_ID })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative h-full min-h-[200px] w-full rounded-2xl border border-dashed p-4',
        'bg-secondary/30 border-border/70 transition-shadow',
        isOver && 'ring-2 ring-blue-500/40 ring-offset-2 ring-offset-background',
      )}
    >
      {tokens.length === 0 ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
          {t('dragDropMathEditor.canvasEmptyHint')}
        </p>
      ) : null}
      {tokens.map((token) => (
        <PositionedCanvasToken
          key={token.id}
          token={token}
          onTokenValueChange={onTokenValueChange}
          onTokenRemove={onTokenRemove}
        />
      ))}
    </div>
  )
}
