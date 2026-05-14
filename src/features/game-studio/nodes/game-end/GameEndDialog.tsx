import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import { GameEndEditor } from './GameEndEditor'
import { GameEndPreview } from './GameEndPreview'
import { GameEndSettings } from './GameEndSettings'

export function GameEndDialog(props: GameNodeDialogProps) {
  const { nodeId, onClose, onDelete } = props
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="End"
    >
      <GameLayout
        editorContent={<GameEndEditor nodeId={nodeId} />}
        previewContent={<GameEndPreview nodeId={nodeId} />}
        settingsContent={
          <GameEndSettings
            nodeId={nodeId}
            onDelete={onDelete}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
