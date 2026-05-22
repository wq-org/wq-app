import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { getFileSignedUrl } from '@/features/files'
import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import { getMissingGameImagePinDefaults, type GameImagePinNodeData } from './game-image-pin.schema'
import { GameImagePinEditor } from './GameImagePinEditor'
import { GameImagePinPreview } from './GameImagePinPreview'
import { GameImagePinSettings } from './GameImagePinSettings'
import { useGameImagePinImageUpload } from './useGameImagePinImageUpload'

export function GameImagePinDialog({
  nodeId,
  onClose,
  onDelete,
  onNavigateToNode,
  nodeData,
  onPatchNodeData,
  flowNodes = [],
  flowEdges = [],
  projectImageGallery,
}: GameNodeDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const { uploadGameImagePinFile } = useGameImagePinImageUpload()
  const gameImagePinNodeData = nodeData as GameImagePinNodeData
  const { points, retryDeductionPercent } = gameImagePinNodeData

  // Capture mount-time values so the effect closure is stable (key={nodeId} on the
  // parent guarantees one fresh mount per node, so these are always this node's values).
  const initRef = useRef({
    filepath: gameImagePinNodeData.filepath ?? '',
    imagePreview: gameImagePinNodeData.imagePreview ?? '',
    cloudFileId: gameImagePinNodeData.cloudFileId ?? null,
    onPatchNodeData,
  })

  useEffect(() => {
    const { filepath, imagePreview, onPatchNodeData: patch } = initRef.current
    const storagePath = filepath.trim()
    if (!storagePath) return

    let cancelled = false
    getFileSignedUrl(storagePath, 3600)
      .then((freshUrl) => {
        if (!cancelled && freshUrl && freshUrl !== imagePreview) {
          queueMicrotask(() =>
            patch({
              imagePreview: freshUrl,
              filepath: storagePath,
              cloudFileId: initRef.current.cloudFileId,
            }),
          )
        }
      })
      .catch(console.error)

    return () => {
      cancelled = true
    }
  }, [])

  const defaultsAppliedRef = useRef(false)

  useEffect(() => {
    if (defaultsAppliedRef.current) return
    const defaultPatch = getMissingGameImagePinDefaults({ points, retryDeductionPercent })
    if (Object.keys(defaultPatch).length === 0) return
    defaultsAppliedRef.current = true
    queueMicrotask(() => onPatchNodeData(defaultPatch))
  }, [onPatchNodeData, points, retryDeductionPercent])

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
      title={t('imagePinDialog.title')}
      description={t('imagePinDialog.description')}
    >
      <GameLayout
        editorContent={
          <GameImagePinEditor
            nodeData={nodeData}
            onPatchNodeData={onPatchNodeData}
            projectImageGallery={projectImageGallery}
            uploadGameImagePinFile={uploadGameImagePinFile}
          />
        }
        previewContent={
          <GameImagePinPreview
            nodeId={nodeId}
            nodeData={gameImagePinNodeData}
          />
        }
        settingsContent={
          <GameImagePinSettings
            nodeId={nodeId}
            onDelete={onDelete}
            onClose={onClose}
            onNavigateToNode={onNavigateToNode}
            onPatchNodeData={onPatchNodeData}
            nodeData={gameImagePinNodeData}
            prevNode={prevNode}
            nextNode={nextNode}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
