import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'

export function GameEndDialog({ nodeId, onClose }: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="End"
      description={`Configure the end node (${nodeId}).`}
    >
      {null}
    </GameNodeDialogShell>
  )
}
