import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import { GameIfElseEditor } from './GameIfElseEditor'
import { GameIfElsePreview } from './GameIfElsePreview'
import { GameIfElseSettings } from './GameIfElseSettings'

export function GameIfElseDialog(props: GameNodeDialogProps) {
  const { nodeId, onClose, onDelete } = props
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="If / else"
    >
      <GameLayout
        editorContent={<GameIfElseEditor nodeId={nodeId} />}
        previewContent={<GameIfElsePreview nodeId={nodeId} />}
        settingsContent={
          <GameIfElseSettings
            nodeId={nodeId}
            onDelete={onDelete}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
