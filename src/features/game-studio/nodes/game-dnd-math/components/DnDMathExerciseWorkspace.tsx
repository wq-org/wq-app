import { useCallback, useMemo, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import {
  DnDMathCanvas,
  canvasCollisionDetection,
  getCanvasTokenIdFromSortableId,
  useDnDMathCanvasRows,
} from './canvas'
import { DropMathNode } from './DropMathNode'
import { DropMathStaticNode } from './DropMathStaticNode'
import { DropTextNode } from './DropTextNode'
import { SigmaNode } from './SigmaNode'
import { MathNodePalette } from './MathNodePalette'
import { collectEquationGroupTokenIds, isFixedMathSuffixToken } from '../utils/mathEquationRow'
import {
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
} from '../types/drag-drop-math.schema'
import type { MathNodeVariant } from '../types/math-node.types'
import { MATH_NODE_PALETTE_DRAG_IDS } from '../constants/drag-drop-math-dnd.constants'
import { resolveDropNodeDefaultValue } from '../constants/math-node.defaults'
import { MATH_NODE_PALETTE_PRESETS } from '../constants/math-node-palette.constants'
import { snapCenterToCursor } from '../utils/snapCenterToCursor'

const dragDropMathEditorEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const
const dragDropMathEditorEnterSubtle =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export type DnDMathExerciseWorkspaceProps = {
  tabId: string
  nodeId: string
  title: string
  canvasRows: readonly DragDropMathCanvasRow[]
  instantColorFeedback: boolean
  onTitleChange: (title: string) => void
  onCanvasRowsChange: (rows: DragDropMathCanvasRow[]) => void
}

function findTokenInRows(rows: readonly DragDropMathCanvasRow[], tokenId: string) {
  for (const row of rows) {
    if (!isTokenCanvasRow(row)) continue
    const token = row.tokens.find((candidate) => candidate.id === tokenId)
    if (token) return token
  }
  return null
}

function findRowForToken(rows: readonly DragDropMathCanvasRow[], tokenId: string) {
  return (
    rows.find(
      (row) => isTokenCanvasRow(row) && row.tokens.some((candidate) => candidate.id === tokenId),
    ) ?? null
  )
}

export function DnDMathExerciseWorkspace({
  tabId,
  nodeId,
  title,
  canvasRows,
  instantColorFeedback,
  onTitleChange,
  onCanvasRowsChange,
}: DnDMathExerciseWorkspaceProps) {
  const { t } = useTranslation('features.gameStudio')
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const resolveDropValue = useCallback(
    (variant: MathNodeVariant, value: string) => resolveDropNodeDefaultValue(variant, value, t),
    [t],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const {
    handleDragEnd: handleCanvasDragEnd,
    reorderRows,
    updateTokenValue,
    commitMathEquation,
    removeToken,
    removeSigmaRow,
  } = useDnDMathCanvasRows({
    rows: canvasRows,
    onRowsChange: onCanvasRowsChange,
    resolveDropValue,
  })

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onTitleChange(event.currentTarget.value)
    },
    [onTitleChange],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null)
      handleCanvasDragEnd(event)
    },
    [handleCanvasDragEnd],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
  }, [])

  const activeDragPreview = useMemo(() => {
    if (!activeDragId) return null

    const palettePreset = MATH_NODE_PALETTE_PRESETS.find(
      (item) => MATH_NODE_PALETTE_DRAG_IDS[item.variant] === activeDragId,
    )
    if (palettePreset) {
      const dropValue = resolveDropValue(palettePreset.variant, palettePreset.value)
      if (palettePreset.variant === 'math') {
        return (
          <DropMathNode
            value={dropValue}
            onCommit={() => {}}
          />
        )
      }
      if (palettePreset.variant === 'sigma') {
        return (
          <SigmaNode
            paletteMode
            label={t('dragDropMathEditor.sigmaBlockLabel')}
          />
        )
      }
      return (
        <DropTextNode
          value={dropValue}
          onValueChange={() => {}}
        />
      )
    }

    const tokenId = getCanvasTokenIdFromSortableId(activeDragId)
    if (tokenId) {
      const sourceRow = findRowForToken(canvasRows, tokenId)
      const canvasToken = findTokenInRows(canvasRows, tokenId)
      if (!canvasToken || !sourceRow) return null

      if (!isTokenCanvasRow(sourceRow)) return null

      const renderCanvasToken = (token: DragDropMathCanvasToken) => {
        if (token.variant === 'math') {
          if (isFixedMathSuffixToken(token)) {
            return (
              <DropMathStaticNode
                key={token.id}
                value={token.value}
                mathShell={token.mathRole === 'equals' ? 'ghost' : token.mathShell}
                compact={token.mathRole === 'equals'}
              />
            )
          }
          return (
            <DropMathNode
              key={token.id}
              value={token.value}
              expression={token.expression}
              mathShell={token.mathShell}
              onCommit={() => {}}
              disabled={token.disabled}
              useGrabCursor={!token.disabled}
              instantColorFeedback={instantColorFeedback}
            />
          )
        }
        return (
          <DropTextNode
            key={token.id}
            value={token.value}
            onValueChange={() => {}}
            disabled={token.disabled}
            useGrabCursor={!token.disabled}
          />
        )
      }

      const groupIds = collectEquationGroupTokenIds(sourceRow, tokenId)
      if (groupIds.length > 1) {
        const groupTokens = groupIds
          .map((id) => sourceRow.tokens.find((candidate) => candidate.id === id))
          .filter((token): token is NonNullable<typeof token> => token != null)
        return (
          <div className="flex flex-wrap items-center gap-2">
            {groupTokens.map(renderCanvasToken)}
          </div>
        )
      }

      return renderCanvasToken(canvasToken)
    }

    return null
  }, [activeDragId, canvasRows, instantColorFeedback, resolveDropValue, t])

  const titleInputId = `drag-drop-math-title-${nodeId}-${tabId}`

  return (
    <>
      <div className={cn('flex flex-col gap-2', dragDropMathEditorEnterSubtle)}>
        <Label htmlFor={titleInputId}>{t('dragDropMathEditor.exerciseTitleLabel')}</Label>
        <Input
          id={titleInputId}
          value={title}
          onChange={handleTitleChange}
          placeholder={t('dragDropMathEditor.exerciseTitlePlaceholder')}
        />
      </div>

      <Separator className={dragDropMathEditorEnterSubtle} />

      <DndContext
        key={tabId}
        sensors={sensors}
        collisionDetection={canvasCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className={cn('flex flex-col gap-4', dragDropMathEditorEnterSubtle)}>
          <MathNodePalette />
        </div>
        <div className={dragDropMathEditorEnterLift}>
          <DnDMathCanvas
            rows={canvasRows}
            instantColorFeedback={instantColorFeedback}
            onRowsReorder={reorderRows}
            onTokenValueChange={updateTokenValue}
            onMathTokenCommit={commitMathEquation}
            onTokenRemove={removeToken}
            onSigmaRemove={removeSigmaRow}
          />
        </div>
        <DragOverlay
          dropAnimation={null}
          modifiers={[snapCenterToCursor]}
        >
          {activeDragPreview}
        </DragOverlay>
      </DndContext>
    </>
  )
}
