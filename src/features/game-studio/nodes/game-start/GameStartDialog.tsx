import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import { GameStartEditor } from './GameStartEditor'
import { GameStartPreview } from './GameStartPreview'
import { GameStartSettings } from './GameStartSettings'

export function GameStartDialog({ nodeId, onClose, onDelete }: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Start"
    >
      <GameLayout
        editorContent={<GameStartEditor nodeId={nodeId} />}
        previewContent={<GameStartPreview nodeId={nodeId} />}
        settingsContent={
          <GameStartSettings
            nodeId={nodeId}
            onDelete={onDelete}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
