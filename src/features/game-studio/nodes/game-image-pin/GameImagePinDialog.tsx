import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import { GameImagePinEditor } from './GameImagePinEditor'
import { GameImagePinPreview } from './GameImagePinPreview'
import { GameImagePinSettings } from './GameImagePinSettings'

export function GameImagePinDialog({
  nodeId,
  onClose,
  onDelete,
  nodeData,
  onPatchNodeData,
}: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Image Pin"
    >
      <GameLayout
        editorContent={
          <GameImagePinEditor
            nodeData={nodeData}
            onPatchNodeData={onPatchNodeData}
          />
        }
        previewContent={<GameImagePinPreview nodeId={nodeId} />}
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
