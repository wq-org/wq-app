import { GameNodeDialogShell } from '../../node-dialog/GameNodeDialogShell'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'

export function GameImagePinDialog({ nodeId, onClose }: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Image Pin"
      description={`Configure the image-pin node (${nodeId}).`}
    >
      {null}
    </GameNodeDialogShell>
  )
}
