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
import { SigmaNode } from './SigmaNode'
import { collectEquationGroupTokenIds, isFixedMathSuffixToken } from '../utils/mathEquationRow'
import {
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
  type GameDragDropMathNodeData,
} from '../types/drag-drop-math.schema'
import type { MathNodeVariant } from '../types/math-node.types'
import { createCanvasRowId } from '../utils/canvasDnd.utils'
import { normalizeSigmaRow } from '../utils/sigmaRow'
import { MATH_NODE_PALETTE_DRAG_IDS } from '../constants/drag-drop-math-dnd.constants'
import { MathNodePalette } from './MathNodePalette'
import { resolveDropNodeDefaultValue } from '../constants/math-node.defaults'
import { MATH_NODE_PALETTE_PRESETS } from '../constants/math-node-palette.constants'
import { snapCenterToCursor } from '../utils/snapCenterToCursor'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  return nodeData.canvasRows.map((row): DragDropMathCanvasRow => {
    if (!row || typeof row !== 'object') {
      return { id: createCanvasRowId(), variant: 'math', tokens: [] }
    }
    if (row.variant === 'sigma') return normalizeSigmaRow(row)
    if (isTokenCanvasRow(row)) return row
    const legacyRow = row as {
      id: string
      tokens?: DragDropMathCanvasToken[]
      variant?: string
    }
    const variant =
      legacyRow.variant === 'math' || legacyRow.variant === 'text'
        ? legacyRow.variant
        : (legacyRow.tokens?.[0]?.variant ?? 'math')
    return {
      id: legacyRow.id,
      variant,
      tokens: Array.isArray(legacyRow.tokens) ? legacyRow.tokens : [],
    }
  })
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

export function DragDropMathEditor({ nodeId, nodeData, onPatchNodeData }: DragDropMathEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const pin = nodeData as GameDragDropMathNodeData
  const descriptionContent = pin.descriptionContent ?? null
  const canvasRows = useMemo(() => resolveCanvasRows(pin), [pin])
  const instantColorFeedback = pin.instantColorFeedback !== false

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
    removeSigmaRow,
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
  }, [activeDragId, canvasRows, instantColorFeedback, resolveDropValue])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className={dragDropMathEditorEnterLift}>
        <Accordion
          type="single"
          collapsible
          defaultValue="task-description"
        >
          <AccordionItem
            value="task-description"
            className="border-b-0"
          >
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              {t('dragDropMathEditor.descriptionLabel')}
            </AccordionTrigger>
            <AccordionContent className="[&_label]:sr-only">
              <LexicalTextarea
                id={`drag-drop-math-description-${nodeId}`}
                label={t('dragDropMathEditor.descriptionLabel')}
                placeholder={t('dragDropMathEditor.descriptionPlaceholder')}
                hydrationKey={nodeId}
                value={descriptionContent}
                onValueChange={handleDescriptionChange}
                minHeight={300}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
    </div>
  )
}
