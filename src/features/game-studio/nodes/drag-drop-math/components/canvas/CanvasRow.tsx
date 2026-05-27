import { useDndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import type { DragControls } from 'motion/react'
import { GripVertical } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { getMathNodeDragData } from '../../types/drag-drop-math-dnd.types'
import type { DragDropMathCanvasToken, TokenCanvasRow } from '../../types/drag-drop-math.schema'
import type { MathNodeVariant } from '../../types/math-node.types'
import {
  collectEquationGroupTokenIds,
  isFixedMathSuffixToken,
  rowHasEquationToken,
} from '../../utils/mathEquationRow'

/**
 * Force result chips to remount on every successful re-evaluation so the
 * `animate-in` entrance plays each time the result value changes. Equation
 * and `=` chips keep a stable id-keyed identity.
 */
import type { MathTokenCommitPayload } from '../../hooks/useMathDropNodeEditor'
import { CanvasRowNode } from './CanvasRowNode'

function getCanvasRowNodeReactKey(token: DragDropMathCanvasToken): string {
  if (token.mathRole === 'result') return `${token.id}:${token.value}`
  return token.id
}
import { CANVAS_ROW_MAX_TOKENS } from '../../utils/canvasDropTarget.utils'
import {
  getCanvasRowSortableId,
  getCanvasTokenSortableId,
} from '../../constants/canvas-dnd.constants'
import {
  CANVAS_ROW_SORTABLE_DATA_KEY,
  getCanvasResultDuplicatePayload,
  getCanvasTokenSortablePayload,
} from '../../types/canvas.types'

type ActiveCanvasDrag = {
  variant: MathNodeVariant
  /** null when the active drag originates from the palette. */
  sourceRowId: string | null
  incomingTokenCount: number
  /** Result-badge duplicate gesture: row bodies must never accept inline. */
  isResultDuplicate: boolean
}

export type CanvasRowProps = {
  row: TokenCanvasRow
  /** Framer Motion drag controls owned by the wrapping Reorder.Item. */
  dragControls: DragControls
  interactionLocked?: boolean
  instantColorFeedback?: boolean
  onTokenValueChange: (tokenId: string, value: string) => void
  onMathTokenCommit: (equationTokenId: string, payload: MathTokenCommitPayload) => void
  onTokenRemove: (tokenId: string) => void
}

/**
 * One canvas row. The row body is a dnd-kit drop target for cross-row token moves;
 * row order itself is owned by the parent Reorder.Item via {@link dragControls}.
 */
export function CanvasRow({
  row,
  dragControls,
  interactionLocked = false,
  instantColorFeedback,
  onTokenValueChange,
  onMathTokenCommit,
  onTokenRemove,
}: CanvasRowProps) {
  const { t } = useTranslation('features.gameStudio')

  const { setNodeRef, isOver } = useDroppable({
    id: getCanvasRowSortableId(row.id),
    data: {
      [CANVAS_ROW_SORTABLE_DATA_KEY]: { rowId: row.id },
    },
  })

  const { active } = useDndContext()

  const activeDrag = useMemo<ActiveCanvasDrag | null>(() => {
    if (!active) return null
    const resultDuplicate = getCanvasResultDuplicatePayload(active.data.current)
    if (resultDuplicate) {
      return {
        variant: 'math',
        sourceRowId: null,
        incomingTokenCount: 1,
        isResultDuplicate: true,
      }
    }
    const paletteData = getMathNodeDragData(active.data.current)
    if (paletteData) {
      return {
        variant: paletteData.variant,
        sourceRowId: null,
        incomingTokenCount: 1,
        isResultDuplicate: false,
      }
    }
    const tokenPayload = getCanvasTokenSortablePayload(active.data.current)
    if (tokenPayload) {
      const incomingTokenCount =
        tokenPayload.rowId === row.id
          ? collectEquationGroupTokenIds(row, tokenPayload.tokenId).length
          : CANVAS_ROW_MAX_TOKENS
      return {
        variant: tokenPayload.variant,
        sourceRowId: tokenPayload.rowId,
        incomingTokenCount: Math.max(1, incomingTokenCount),
        isResultDuplicate: false,
      }
    }
    return null
  }, [active, row])

  // A drop into this row creates a new row (instead of landing inline) when
  // the dragged variant doesn't match this row, or the row already holds the
  // maximum number of tokens. Same-row reorders are always allowed.
  const wouldRejectInline = useMemo(() => {
    if (!activeDrag) return false
    if (activeDrag.isResultDuplicate) return true
    if (activeDrag.sourceRowId === row.id) return false
    if (activeDrag.variant !== row.variant) return true
    if (activeDrag.variant === 'math' && rowHasEquationToken(row)) return true
    return row.tokens.length + activeDrag.incomingTokenCount > CANVAS_ROW_MAX_TOKENS
  }, [activeDrag, row])

  const showRejectFeedback = isOver && wouldRejectInline
  const showAcceptFeedback = isOver && !wouldRejectInline
  const isDragSession = active != null
  const isCompactLayout = !isDragSession

  const tokenSortableIds = row.tokens
    .filter((token) => !token.disabled && !isFixedMathSuffixToken(token))
    .map((token) => getCanvasTokenSortableId(token.id))

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'group/canvas-row relative flex w-full items-center gap-1.5 rounded-md border-2 border-dashed border-transparent px-2 transition-[min-height,padding,colors] duration-150',
        isCompactLayout ? 'min-h-0 py-1' : 'min-h-14 py-2.5',
        showAcceptFeedback && 'border-blue-400/60 bg-blue-500/10',
        showRejectFeedback && 'border-red-500/70 bg-red-500/10',
      )}
    >
      {!interactionLocked ? (
        <button
          type="button"
          aria-label={t('dragDropMathEditor.reorderRowAriaLabel')}
          className={cn(
            'flex shrink-0 items-center justify-center rounded text-muted-foreground/60',
            'opacity-0 transition-opacity duration-150',
            'group-hover/canvas-row:opacity-100 focus-visible:opacity-100',
            'cursor-grab touch-none hover:text-foreground active:cursor-grabbing',
            isCompactLayout ? 'h-6 w-4' : 'mt-0.5 h-7 w-5',
          )}
          onPointerDown={(event) => {
            event.stopPropagation()
            dragControls.start(event)
          }}
        >
          <GripVertical
            className="h-4 w-4"
            aria-hidden
          />
        </button>
      ) : (
        <span
          className={cn('shrink-0', isCompactLayout ? 'h-6 w-4' : 'mt-0.5 h-7 w-5')}
          aria-hidden
        />
      )}
      <SortableContext
        items={tokenSortableIds}
        strategy={horizontalListSortingStrategy}
      >
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-wrap items-center',
            isCompactLayout ? 'min-h-0 gap-1' : 'min-h-12 gap-1.5 sm:gap-2',
          )}
        >
          {row.tokens.map((token) => (
            <CanvasRowNode
              key={getCanvasRowNodeReactKey(token)}
              rowId={row.id}
              token={token}
              compact={isCompactLayout}
              instantColorFeedback={instantColorFeedback}
              onTokenValueChange={onTokenValueChange}
              onMathTokenCommit={onMathTokenCommit}
              onRemove={onTokenRemove}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
