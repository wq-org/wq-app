import { useDraggable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { DropMathNode } from '../DropMathNode'
import { DropMathStaticNode } from '../DropMathStaticNode'
import { DropTextNode } from '../DropTextNode'
import type { DragDropMathCanvasToken } from '../../types/drag-drop-math.schema'
import type { MathTokenCommitPayload } from '../../hooks/useMathDropNodeEditor'
import { getCanvasTokenSortableId } from '../../constants/canvas-dnd.constants'
import {
  CANVAS_RESULT_DUPLICATE_DATA_KEY,
  CANVAS_TOKEN_SORTABLE_DATA_KEY,
} from '../../types/canvas.types'

export type CanvasRowNodeProps = {
  rowId: string
  token: DragDropMathCanvasToken
  compact?: boolean
  /** Preview submit lock — disables chip drag/edit even when token.disabled is false. */
  interactionLocked?: boolean
  instantColorFeedback?: boolean
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (equationTokenId: string, payload: MathTokenCommitPayload) => void
  onRemove: (equationTokenId: string) => void
}

export function CanvasRowNode(props: CanvasRowNodeProps) {
  const { token } = props

  if (token.mathRole === 'equals') {
    return (
      <DropMathStaticNode
        value={token.value}
        mathShell="ghost"
        compact
      />
    )
  }

  if (token.mathRole === 'result') {
    return <CanvasResultDraggable {...props} />
  }

  return <CanvasSortableRowNode {...props} />
}

function CanvasSortableRowNode({
  rowId,
  token,
  compact = false,
  interactionLocked = false,
  instantColorFeedback,
  onTokenValueChange,
  onMathTokenCommit,
  onRemove,
}: CanvasRowNodeProps) {
  const { t } = useTranslation('features.gameStudio')
  const dragDisabled = interactionLocked || token.disabled

  const editAriaLabel =
    token.variant === 'math'
      ? t('dragDropMathEditor.editMathTokenAriaLabel')
      : t('dragDropMathEditor.editTextTokenAriaLabel')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: getCanvasTokenSortableId(token.id),
    disabled: dragDisabled,
    data: {
      [CANVAS_TOKEN_SORTABLE_DATA_KEY]: {
        rowId,
        tokenId: token.id,
        variant: token.variant,
      },
    },
  })

  const dragSurfaceClassName = cn(
    'max-w-full shrink-0',
    !dragDisabled && 'touch-none cursor-grab active:cursor-grabbing',
    isDragging && 'opacity-0',
  )

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={dragSurfaceClassName}
      {...(dragDisabled ? {} : { ...attributes, ...listeners })}
    >
      {token.variant === 'math' ? (
        <DropMathNode
          value={token.value}
          expression={token.expression}
          mathShell={token.mathShell}
          onCommit={(payload) => onMathTokenCommit(token.id, payload)}
          onRemove={() => onRemove(token.id)}
          disabled={dragDisabled}
          editAriaLabel={editAriaLabel}
          useGrabCursor={!dragDisabled}
          compact={compact}
          instantColorFeedback={instantColorFeedback}
        />
      ) : (
        <DropTextNode
          value={token.value}
          onValueChange={(next) => onTokenValueChange(token.id, next)}
          onRemove={() => onRemove(token.id)}
          disabled={dragDisabled}
          editAriaLabel={editAriaLabel}
          useGrabCursor={!dragDisabled}
          compact={compact}
        />
      )}
    </div>
  )
}

function CanvasResultDraggable({ token, interactionLocked = false }: CanvasRowNodeProps) {
  const { t } = useTranslation('features.gameStudio')
  // `token.disabled` only blocks inline editing; result chips stay draggable for sigma/new-row duplicate.
  const dragDisabled = interactionLocked
  const ariaLabel = t('dragDropMathEditor.duplicateResultAriaLabel', {
    defaultValue: 'Drag result {{value}} into a new row',
    value: token.value,
  })

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: getCanvasTokenSortableId(token.id),
    disabled: dragDisabled,
    data: {
      [CANVAS_RESULT_DUPLICATE_DATA_KEY]: {
        sourceTokenId: token.id,
        value: token.value,
      },
    },
  })

  if (dragDisabled) {
    return (
      <DropMathStaticNode
        value={token.value}
        mathShell={token.mathShell === 'error' ? 'error' : 'ghost'}
        compact
      />
    )
  }

  const wrapperClassName = cn(
    'max-w-full shrink-0 cursor-grab touch-none active:cursor-grabbing',
    isDragging && 'opacity-0',
  )

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={wrapperClassName}
      aria-label={ariaLabel}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
    >
      <DropMathStaticNode
        value={token.value}
        mathShell="ghost"
        compact
        className="cursor-grab active:cursor-grabbing"
      />
    </div>
  )
}
