import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { SerializedEditorState } from 'lexical'

import { LexicalTextarea } from '@/components/shared/lexical-textarea'

import type { GameNodeDataPatch } from '../_registry/game-node-registry.types'
import type { GameDragDropMathNodeData } from './drag-drop-math.schema'

export type DragDropMathEditorProps = {
  nodeId: string
  nodeData: Record<string, unknown>
  onPatchNodeData: (patch: GameNodeDataPatch) => void
}

export function DragDropMathEditor({ nodeId, nodeData, onPatchNodeData }: DragDropMathEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const pin = nodeData as GameDragDropMathNodeData
  const descriptionContent = pin.descriptionContent ?? null

  const handleDescriptionChange = useCallback(
    (next: SerializedEditorState) => {
      onPatchNodeData({ descriptionContent: next })
    },
    [onPatchNodeData],
  )

  return (
    <div className="flex w-full flex-col gap-4">
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
  )
}
