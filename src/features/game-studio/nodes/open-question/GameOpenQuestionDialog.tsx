import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'

export function GameOpenQuestionDialog({ nodeId, onClose }: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Open question"
      description={`Configure the open question node (${nodeId}).`}
    >
      {null}
    </GameNodeDialogShell>
  )
}
