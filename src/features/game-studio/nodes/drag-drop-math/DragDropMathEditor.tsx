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

import type { GameNodeDataPatch } from '../_registry/game-node-registry.types'
import {
  DragDropMathCanvas,
  canvasCollisionDetection,
  getCanvasTokenIdFromSortableId,
  useDragDropMathCanvasRows,
} from './canvas'
import { DropMathNode } from './DropMathNode'
import { DropTextNode } from './DropTextNode'
import type { DragDropMathCanvasRow, GameDragDropMathNodeData } from './drag-drop-math.schema'
import { MATH_NODE_PALETTE_DRAG_IDS } from './drag-drop-math-dnd.constants'
import { MathNodePalette } from './MathNodePalette'
import { resolveDropNodeDefaultValue } from './math-node.defaults'
import { MATH_NODE_PALETTE_PRESETS } from './math-node-palette.constants'
import { snapCenterToCursor } from './snapCenterToCursor'

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
            onValueChange={() => {}}
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
      const canvasToken = findTokenInRows(canvasRows, tokenId)
      if (!canvasToken) return null
      const overlayProps = {
        value: canvasToken.value,
        onValueChange: () => {},
        disabled: canvasToken.disabled,
        useGrabCursor: !canvasToken.disabled,
      }
      return canvasToken.variant === 'math' ? (
        <DropMathNode {...overlayProps} />
      ) : (
        <DropTextNode {...overlayProps} />
      )
    }

    return null
  }, [activeDragId, canvasRows, resolveDropValue])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <LexicalTextarea
        id={`drag-drop-math-description-${nodeId}`}
        label={t('dragDropMathEditor.descriptionLabel')}
        placeholder={t('dragDropMathEditor.descriptionPlaceholder')}
        hydrationKey={nodeId}
        value={descriptionContent}
        onValueChange={handleDescriptionChange}
        minHeight={300}
      />

      <Label htmlFor={`drag-drop-math-title-${nodeId}`}>
        {t('dragDropMathEditor.exerciseTitleLabel')}
      </Label>
      <Input
        id={`drag-drop-math-title-${nodeId}`}
        value={pin.title ?? ''}
        onChange={handleTitleChange}
        placeholder={t('dragDropMathEditor.exerciseTitlePlaceholder')}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={canvasCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <MathNodePalette />
        <DragDropMathCanvas
          rows={canvasRows}
          onRowsReorder={reorderRows}
          onTokenValueChange={updateTokenValue}
          onTokenRemove={removeToken}
        />
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
