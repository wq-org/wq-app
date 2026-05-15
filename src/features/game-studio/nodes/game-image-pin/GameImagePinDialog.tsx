import { useTranslation } from 'react-i18next'

import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import type { GameImagePinNodeData } from './game-image-pin.schema'
import { GameImagePinEditor } from './GameImagePinEditor'
import { GameImagePinPreview } from './GameImagePinPreview'
import { GameImagePinSettings } from './GameImagePinSettings'
import { useGameImagePinImageUpload } from './useGameImagePinImageUpload'

export function GameImagePinDialog({
  nodeId,
  onClose,
  onDelete,
  nodeData,
  onPatchNodeData,
  projectImageGallery,
}: GameNodeDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const { uploadGameImagePinFile } = useGameImagePinImageUpload()
  const gameImagePinNodeData = nodeData as GameImagePinNodeData

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
          />
        }
      />
    </GameNodeDialogShell>
  )
}
