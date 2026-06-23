import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getFileSignedUrl } from '@/features/cloud'
import { useGameEditorContext } from '@/contexts/game-studio'
import type { EditorExternalInsertApi } from '@/features/lexical-editor'
import { GameNodeDialogShell } from '../../../components/GameNodeDialogShell'
import { GameLayout } from '../../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../../_registry/game-node-registry.types'
import { getMissingGameImagePinDefaults, type GameImagePinNodeData } from '../image-pin.schema'
import { useImagePinImageUpload } from '../hooks/useImagePinImageUpload'
import { ImagePinEditor } from './ImagePinEditor'
import { ImagePinPreview } from './ImagePinPreview'
import { ImagePinSettings } from './ImagePinSettings'

export function ImagePinDialog({
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
  const editorContext = useGameEditorContext()
  const { uploadImagePinFile } = useImagePinImageUpload()
  const gameImagePinNodeData = nodeData as GameImagePinNodeData
  const { points, retryDeductionPercent } = gameImagePinNodeData
  const [pendingPreviewSrc, setPendingPreviewSrc] = useState<string | null>(null)

  const nodeDataRef = useRef(gameImagePinNodeData)
  const descriptionInsertApiRef = useRef<EditorExternalInsertApi | null>(null)

  useEffect(() => {
    nodeDataRef.current = gameImagePinNodeData
  }, [gameImagePinNodeData])

  const handleDescriptionInsertReady = useCallback((api: EditorExternalInsertApi | null) => {
    descriptionInsertApiRef.current = api
  }, [])

  // Rich-text: use the live Lexical append API
  const setDescriptionText = useCallback((text: string) => {
    descriptionInsertApiRef.current?.appendText(text)
  }, [])
  const insertDescriptionImage = useCallback((url: string) => {
    descriptionInsertApiRef.current?.appendImage(url)
  }, [])

  const setImageUrl = useCallback(
    (url: string) => {
      onPatchNodeData({ imagePreview: url, filepath: '', cloudFileId: null })
    },
    [onPatchNodeData],
  )
  const getImageUrl = useCallback(() => nodeDataRef.current.imagePreview ?? '', [])

  useEffect(() => {
    editorContext?.registerNodeFields([
      {
        nodeId,
        fieldKey: 'description',
        label: t('agent.insertIntoDescription'),
        type: 'rich-text',
        setValue: setDescriptionText,
        insertImageUrl: insertDescriptionImage,
        imageInsertLabel: t('agent.insertIntoDescription'),
      },
      {
        nodeId,
        fieldKey: 'image_url',
        label: t('agent.insertImageUrl'),
        type: 'image',
        setValue: setImageUrl,
        getValue: getImageUrl,
        insertImageUrl: setImageUrl,
        imageInsertLabel: t('agent.insertIntoImage'),
      },
    ])
    return () => editorContext?.unregisterNodeFields(nodeId)
  }, [
    nodeId,
    editorContext,
    setDescriptionText,
    insertDescriptionImage,
    setImageUrl,
    getImageUrl,
    t,
  ])
  const previewNodeData = useMemo(
    () =>
      pendingPreviewSrc
        ? { ...gameImagePinNodeData, imagePreview: pendingPreviewSrc }
        : gameImagePinNodeData,
    [gameImagePinNodeData, pendingPreviewSrc],
  )

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
        if (cancelled) return
        if (freshUrl && freshUrl !== imagePreview) {
          queueMicrotask(() =>
            patch({
              imagePreview: freshUrl,
              filepath: storagePath,
              cloudFileId: initRef.current.cloudFileId,
            }),
          )
          return
        }
        if (!freshUrl) {
          queueMicrotask(() =>
            patch({
              imagePreview: '',
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
          <ImagePinEditor
            nodeId={nodeId}
            nodeData={nodeData}
            onPatchNodeData={onPatchNodeData}
            pendingPreviewSrc={pendingPreviewSrc}
            onPendingPreviewSrcChange={setPendingPreviewSrc}
            projectImageGallery={projectImageGallery}
            uploadImagePinFile={uploadImagePinFile}
            onDescriptionInsertReady={handleDescriptionInsertReady}
          />
        }
        previewContent={
          <ImagePinPreview
            nodeId={nodeId}
            nodeData={previewNodeData}
          />
        }
        settingsContent={
          <ImagePinSettings
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
