import { GameNodeDialogShell } from '../../node-dialog/GameNodeDialogShell'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'

export function GameStartDialog({ nodeId, onClose }: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Start"
      description={`Configure the start node (${nodeId}).`}
    >
      {null}
    </GameNodeDialogShell>
  )
}
