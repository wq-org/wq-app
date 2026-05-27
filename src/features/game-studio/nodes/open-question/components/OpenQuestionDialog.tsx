import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { GameNodeDialogShell } from '../../../components/GameNodeDialogShell'
import { GameLayout } from '../../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../../_registry/game-node-registry.types'
import type { GameOpenQuestionNodeData } from '../types/open-question.schema'
import { getMissingOpenQuestionDefaults } from '../utils'
import { OpenQuestionEditor } from './OpenQuestionEditor'
import { OpenQuestionPreview } from './OpenQuestionPreview'
import { OpenQuestionSettings } from './OpenQuestionSettings'

export function OpenQuestionDialog({
  nodeId,
  onClose,
  onDelete,
  onNavigateToNode,
  nodeData,
  onPatchNodeData,
  flowNodes = [],
  flowEdges = [],
}: GameNodeDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const openQuestionNodeData = nodeData as GameOpenQuestionNodeData
  const { points } = openQuestionNodeData

  const defaultsAppliedRef = useRef(false)

  useEffect(() => {
    if (defaultsAppliedRef.current) return
    const defaultPatch = getMissingOpenQuestionDefaults({ points })
    if (Object.keys(defaultPatch).length === 0) return
    defaultsAppliedRef.current = true
    queueMicrotask(() => onPatchNodeData(defaultPatch))
  }, [onPatchNodeData, points])

  const prevEdge = flowEdges.find((edge) => edge.target === nodeId)
  const nextEdge = flowEdges.find((edge) => edge.source === nodeId)
  const prevNode = prevEdge
    ? { id: prevEdge.source, nodeType: flowNodes.find((node) => node.id === prevEdge.source)?.type }
    : undefined
  const nextNode = nextEdge
    ? { id: nextEdge.target, nodeType: flowNodes.find((node) => node.id === nextEdge.target)?.type }
    : undefined

  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={t('openQuestionDialog.title')}
      description={t('openQuestionDialog.description')}
    >
      <GameLayout
        editorContent={<OpenQuestionEditor nodeId={nodeId} />}
        previewContent={<OpenQuestionPreview nodeId={nodeId} />}
        settingsContent={
          <OpenQuestionSettings
            nodeId={nodeId}
            onDelete={onDelete}
            onClose={onClose}
            onNavigateToNode={onNavigateToNode}
            onPatchNodeData={onPatchNodeData}
            nodeData={openQuestionNodeData}
            prevNode={prevNode}
            nextNode={nextNode}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
