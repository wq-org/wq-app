import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { DragControls } from 'motion/react'
import { GripVertical, X } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { SigmaNode, sigmaOrangeClassName } from '../SigmaNode'
import { DropMathStaticNode } from '../DropMathStaticNode'
import type { SigmaCanvasRow } from '../../types/sigma-row.types'
import { getCanvasSigmaDropId } from '../../constants/canvas-dnd.constants'
import { getMathNodeDragData } from '../../types/drag-drop-math-dnd.types'
import {
  CANVAS_RESULT_DUPLICATE_DATA_KEY,
  CANVAS_SIGMA_DROP_DATA_KEY,
  getCanvasResultDuplicatePayload,
  getCanvasTokenSortablePayload,
} from '../../types/canvas.types'
import {
  formatSigmaItemDisplay,
  isSigmaDropAllowed,
  parseResultChipValue,
} from '../../utils/sigmaRow'

export type SigmaCanvasRowProps = {
  row: SigmaCanvasRow
  dragControls: DragControls
  onReset: (rowId: string) => void
}

type SigmaDropSourceKind = 'result' | 'palette' | 'token'

function resolveSigmaDropSourceKind(activeData: unknown): SigmaDropSourceKind | null {
  if (getCanvasResultDuplicatePayload(activeData)) return 'result'
  if (getMathNodeDragData(activeData)) return 'palette'
  if (getCanvasTokenSortablePayload(activeData)) return 'token'
  return null
}

export function SigmaCanvasRow({ row, dragControls, onReset }: SigmaCanvasRowProps) {
  const { t } = useTranslation('features.gameStudio')
  const dropId = getCanvasSigmaDropId(row.id)

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropId,
    data: {
      [CANVAS_SIGMA_DROP_DATA_KEY]: { rowId: row.id },
    },
  })

  const { active } = useDndContext()
  const dropSourceKind = resolveSigmaDropSourceKind(active?.data.current)
  const isResultDuplicateDrag = dropSourceKind === 'result'

  const hoverDecision = useMemo(() => {
    const resultDuplicate = getCanvasResultDuplicatePayload(active?.data.current)
    if (!resultDuplicate || !isOver) return null
    const parsed = parseResultChipValue(resultDuplicate.value)
    if (!parsed) return { allowed: false as const, message: 'Ungültiger Ergebniswert.' }
    return isSigmaDropAllowed(row, parsed)
  }, [active?.data.current, isOver, row])

  const wrongSourceMessage = t('dragDropMathEditor.sigmaWrongSourceHint', {
    defaultValue: 'Nur Ergebnis-Chips (= Wert) erlaubt — keine Mathe- oder Textbausteine.',
  })

  const showWrongSource = isOver && dropSourceKind !== null && dropSourceKind !== 'result'
  const showBlocked = showWrongSource || (hoverDecision !== null && !hoverDecision.allowed)
  const blockedMessage = showWrongSource
    ? wrongSourceMessage
    : hoverDecision !== null && !hoverDecision.allowed
      ? hoverDecision.message
      : null

  const hasItems = row.items.length > 0
  const showAcceptFeedback = isOver && !showBlocked && isResultDuplicateDrag

  return (
    <div
      className={cn(
        'group/sigma-row relative w-full rounded-md border-2 border-dashed border-transparent transition-colors duration-150',
        showBlocked && 'border-red-500/70 bg-red-500/10',
        showAcceptFeedback && 'border-blue-400/60 bg-blue-500/10',
      )}
    >
      <div
        ref={setDropRef}
        className={cn(
          'flex w-full min-h-14 flex-col gap-2 px-2 py-2.5',
          isResultDuplicateDrag && 'min-h-16',
        )}
      >
        <div className="flex w-full items-start gap-1.5">
          <button
            type="button"
            aria-label={t('dragDropMathEditor.reorderRowAriaLabel')}
            className={cn(
              'mt-0.5 flex shrink-0 items-center justify-center rounded text-muted-foreground/60',
              'opacity-0 transition-opacity duration-150',
              'group-hover/sigma-row:opacity-100 focus-visible:opacity-100',
              'cursor-grab touch-none hover:text-foreground active:cursor-grabbing',
              'h-7 w-5',
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

          <SigmaNode
            label={t('dragDropMathEditor.sigmaBlockLabel')}
            className={cn('shrink-0', sigmaOrangeClassName)}
          />

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {row.items.map((item) => (
              <DropMathStaticNode
                key={item.id}
                value={formatSigmaItemDisplay(item)}
                mathShell="ghost"
                compact
              />
            ))}

            <span
              className={cn(
                'min-h-10 min-w-[5rem] flex-1 basis-28 rounded-md border border-dashed px-2 py-2 text-xs text-muted-foreground/70',
                hasItems ? 'border-border/40' : 'flex items-center justify-center border-border/50',
                isResultDuplicateDrag && !hasItems && 'border-blue-400/50 bg-blue-500/5',
                isResultDuplicateDrag && hasItems && 'border-blue-400/30',
                showBlocked && 'border-red-400/50',
              )}
            >
              {hasItems
                ? t('dragDropMathEditor.sigmaDropHint', { defaultValue: 'Drop hier' })
                : t('dragDropMathEditor.sigmaEmptyHint', {
                    defaultValue: 'Ergebnis-Chips hierher ziehen',
                  })}
            </span>

            {showBlocked && blockedMessage ? (
              <span
                className="w-full text-xs text-red-600 dark:text-red-400"
                role="status"
              >
                ⊘ {blockedMessage}
              </span>
            ) : null}
          </div>

          {hasItems ? (
            <button
              type="button"
              aria-label={t('dragDropMathEditor.sigmaResetAriaLabel', {
                defaultValue: 'Summe zurücksetzen',
              })}
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onReset(row.id)}
            >
              <X
                className="h-4 w-4"
                aria-hidden
              />
            </button>
          ) : null}
        </div>

        {row.resultDisplay ? (
          <div className="flex justify-end pr-1">
            <SigmaResultDraggable
              rowId={row.id}
              resultTokenId={row.resultTokenId}
              value={row.resultDisplay}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SigmaResultDraggable({
  resultTokenId,
  value,
}: {
  rowId: string
  resultTokenId: string
  value: string
}) {
  const { t } = useTranslation('features.gameStudio')
  const ariaLabel = t('dragDropMathEditor.duplicateResultAriaLabel', {
    defaultValue: 'Drag result {{value}} into a new row',
    value,
  })

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sigma-result-${resultTokenId}`,
    data: {
      [CANVAS_RESULT_DUPLICATE_DATA_KEY]: {
        sourceTokenId: resultTokenId,
        value,
      },
    },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn('cursor-grab touch-none active:cursor-grabbing', isDragging && 'opacity-0')}
      aria-label={ariaLabel}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
    >
      <span className="text-sm font-medium text-muted-foreground">= </span>
      <DropMathStaticNode
        value={value}
        mathShell="ghost"
        compact
      />
    </div>
  )
}
