import { GameNodeDialogShell } from '../../node-dialog/GameNodeDialogShell'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'

export function GameIfElseDialog({ nodeId, onClose }: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="If / else"
      description={`Configure the branching node (${nodeId}).`}
    >
      {null}
    </GameNodeDialogShell>
  )
}
