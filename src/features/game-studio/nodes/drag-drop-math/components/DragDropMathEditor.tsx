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
import type { SerializedEditorState } from 'lexical'

import { LexicalTextarea } from '@/components/shared/lexical-textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import type { GameNodeDataPatch } from '../../_registry/game-node-registry.types'
import {
  DragDropMathCanvas,
  canvasCollisionDetection,
  getCanvasTokenIdFromSortableId,
  useDragDropMathCanvasRows,
} from './canvas'
import { DropMathNode } from './DropMathNode'
import { DropMathStaticNode } from './DropMathStaticNode'
import { DropTextNode } from './DropTextNode'
import { collectEquationGroupTokenIds, isFixedMathSuffixToken } from '../utils/mathEquationRow'
import type {
  DragDropMathCanvasRow,
  GameDragDropMathNodeData,
} from '../types/drag-drop-math.schema'
import { MATH_NODE_PALETTE_DRAG_IDS } from '../constants/drag-drop-math-dnd.constants'
import { MathNodePalette } from './MathNodePalette'
import { resolveDropNodeDefaultValue } from '../constants/math-node.defaults'
import { MATH_NODE_PALETTE_PRESETS } from '../constants/math-node-palette.constants'
import { snapCenterToCursor } from '../utils/snapCenterToCursor'
import { Separator } from '@/components/ui/separator'

const dragDropMathEditorEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const
const dragDropMathEditorEnterSubtle =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export type DragDropMathEditorProps = {
  nodeId: string
  nodeData: Record<string, unknown>
  onPatchNodeData: (patch: GameNodeDataPatch) => void
}

function resolveCanvasRows(nodeData: GameDragDropMathNodeData): DragDropMathCanvasRow[] {
  if (!Array.isArray(nodeData.canvasRows)) return []
  return nodeData.canvasRows.map((row) => {
    if (row.variant) return row
    const inferredVariant = row.tokens[0]?.variant ?? 'math'
    return { ...row, variant: inferredVariant }
  })
}

function findTokenInRows(rows: readonly DragDropMathCanvasRow[], tokenId: string) {
  for (const row of rows) {
    const token = row.tokens.find((candidate) => candidate.id === tokenId)
    if (token) return token
  }
  return null
}

function findRowForToken(rows: readonly DragDropMathCanvasRow[], tokenId: string) {
  return rows.find((row) => row.tokens.some((candidate) => candidate.id === tokenId)) ?? null
}

export function DragDropMathEditor({ nodeId, nodeData, onPatchNodeData }: DragDropMathEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const pin = nodeData as GameDragDropMathNodeData
  const descriptionContent = pin.descriptionContent ?? null
  const canvasRows = useMemo(() => resolveCanvasRows(pin), [pin])

  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const resolveDropValue = useCallback(
    (variant: 'math' | 'text', value: string) => resolveDropNodeDefaultValue(variant, value, t),
    [t],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const patchCanvasRows = useCallback(
    (nextRows: DragDropMathCanvasRow[]) => {
      onPatchNodeData({ canvasRows: nextRows })
    },
    [onPatchNodeData],
  )

  const {
    handleDragEnd: handleCanvasDragEnd,
    reorderRows,
    updateTokenValue,
    commitMathEquation,
    removeToken,
  } = useDragDropMathCanvasRows({
    rows: canvasRows,
    onRowsChange: patchCanvasRows,
    resolveDropValue,
  })

  const handleDescriptionChange = useCallback(
    (next: SerializedEditorState) => {
      onPatchNodeData({ descriptionContent: next })
    },
    [onPatchNodeData],
  )

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onPatchNodeData({ title: event.currentTarget.value })
    },
    [onPatchNodeData],
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

      const renderCanvasToken = (token: (typeof canvasRows)[number]['tokens'][number]) => {
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
  }, [activeDragId, canvasRows, resolveDropValue])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className={dragDropMathEditorEnterLift}>
        <LexicalTextarea
          id={`drag-drop-math-description-${nodeId}`}
          label={t('dragDropMathEditor.descriptionLabel')}
          placeholder={t('dragDropMathEditor.descriptionPlaceholder')}
          hydrationKey={nodeId}
          value={descriptionContent}
          onValueChange={handleDescriptionChange}
          minHeight={300}
        />
      </div>

      <div className={cn('flex flex-col gap-2', dragDropMathEditorEnterSubtle)}>
        <Label htmlFor={`drag-drop-math-title-${nodeId}`}>
          {t('dragDropMathEditor.exerciseTitleLabel')}
        </Label>
        <Input
          id={`drag-drop-math-title-${nodeId}`}
          value={pin.title ?? ''}
          onChange={handleTitleChange}
          placeholder={t('dragDropMathEditor.exerciseTitlePlaceholder')}
        />
      </div>

      <Separator className={dragDropMathEditorEnterSubtle} />

      <DndContext
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
          <DragDropMathCanvas
            rows={canvasRows}
            onRowsReorder={reorderRows}
            onTokenValueChange={updateTokenValue}
            onMathTokenCommit={commitMathEquation}
            onTokenRemove={removeToken}
          />
        </div>
        <DragOverlay
          dropAnimation={null}
          modifiers={[snapCenterToCursor]}
        >
          {activeDragPreview}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
