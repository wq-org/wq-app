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
import { DragDropCanvas } from './DragDropCanvas'
import { DropMathNode } from './DropMathNode'
import { DropTextNode } from './DropTextNode'
import { DraggableDropNode } from './DraggableDropNode'
import type { DragDropMathCanvasToken, GameDragDropMathNodeData } from './drag-drop-math.schema'
import { MATH_NODE_PALETTE_DRAG_IDS, getMathNodeCanvasDragId } from './drag-drop-math-dnd.constants'
import { MathNodePalette } from './MathNodePalette'
import { resolveDropNodeDefaultValue } from './math-node.defaults'
import { MATH_NODE_PALETTE_PRESETS } from './math-node-palette.constants'
import { snapCenterToCursor } from './snapCenterToCursor'
import { useDragDropMathCanvasDnd } from './useDragDropMathCanvasDnd'

export type DragDropMathEditorProps = {
  nodeId: string
  nodeData: Record<string, unknown>
  onPatchNodeData: (patch: GameNodeDataPatch) => void
}

function resolveCanvasTokens(nodeData: GameDragDropMathNodeData): DragDropMathCanvasToken[] {
  return Array.isArray(nodeData.canvasTokens) ? nodeData.canvasTokens : []
}

export function DragDropMathEditor({ nodeId, nodeData, onPatchNodeData }: DragDropMathEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const pin = nodeData as GameDragDropMathNodeData
  const descriptionContent = pin.descriptionContent ?? null
  const canvasTokens = useMemo(() => resolveCanvasTokens(pin), [pin])

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

  const patchCanvasTokens = useCallback(
    (nextTokens: DragDropMathCanvasToken[]) => {
      onPatchNodeData({ canvasTokens: nextTokens })
    },
    [onPatchNodeData],
  )

  const { handleDragEnd: handleCanvasDragEnd } = useDragDropMathCanvasDnd({
    tokens: canvasTokens,
    onTokensChange: patchCanvasTokens,
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

  const handleTokenValueChange = useCallback(
    (tokenId: string, value: string) => {
      patchCanvasTokens(
        canvasTokens.map((token) => (token.id === tokenId ? { ...token, value } : token)),
      )
    },
    [canvasTokens, patchCanvasTokens],
  )

  const handleTokenRemove = useCallback(
    (tokenId: string) => {
      patchCanvasTokens(canvasTokens.filter((token) => token.id !== tokenId))
    },
    [canvasTokens, patchCanvasTokens],
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

    const canvasToken = canvasTokens.find(
      (token) => getMathNodeCanvasDragId(token.id) === activeDragId,
    )
    if (!canvasToken) return null

    return (
      <DraggableDropNode
        dragId={activeDragId}
        dragData={{ source: 'canvas', tokenId: canvasToken.id }}
        variant={canvasToken.variant}
        value={canvasToken.value}
        onValueChange={() => {}}
        disabled={canvasToken.disabled}
        isDragOverlay
      />
    )
  }, [activeDragId, canvasTokens, resolveDropValue])

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
        modifiers={[snapCenterToCursor]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <MathNodePalette />
        <DragDropCanvas
          tokens={canvasTokens}
          onTokenValueChange={handleTokenValueChange}
          onTokenRemove={handleTokenRemove}
        />
        <DragOverlay dropAnimation={null}>{activeDragPreview}</DragOverlay>
      </DndContext>
    </div>
  )
}
