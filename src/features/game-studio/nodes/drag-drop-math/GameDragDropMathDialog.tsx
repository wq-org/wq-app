import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import { DragDropMathEditor } from './DragDropMathEditor'
import { DragDropMathPreview } from './DragDropMathPreview'
import { DragDropMathSettings } from './DragDropMathSettings'

export function GameDragDropMathDialog(props: GameNodeDialogProps) {
  const { nodeId, nodeData, onPatchNodeData, onClose, onDelete } = props
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Drag & drop math"
    >
      <GameLayout
        editorContent={
          <DragDropMathEditor
            nodeId={nodeId}
            nodeData={nodeData}
            onPatchNodeData={onPatchNodeData}
          />
        }
        previewContent={<DragDropMathPreview nodeId={nodeId} />}
        settingsContent={
          <DragDropMathSettings
            nodeId={nodeId}
            onDelete={onDelete}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
