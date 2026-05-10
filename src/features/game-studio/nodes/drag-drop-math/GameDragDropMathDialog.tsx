import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'

export function GameDragDropMathDialog({ nodeId, onClose }: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Drag & drop math"
      description={`Configure the drag-and-drop math node (${nodeId}).`}
    >
      {null}
    </GameNodeDialogShell>
  )
}
