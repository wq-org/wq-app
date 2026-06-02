import { GameNodeDialogShell } from '../../../components/GameNodeDialogShell'
import { GameLayout } from '../../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../../_registry/game-node-registry.types'
import type { GameDragDropMathNodeData } from '../types/drag-drop-math.schema'
import { DnDMathEditor } from './DnDMathEditor'
import { DnDMathPreview } from './DnDMathPreview'
import { DnDMathSettings } from './DnDMathSettings'

export function DnDMathDialog(props: GameNodeDialogProps) {
  const {
    nodeId,
    nodeData,
    onPatchNodeData,
    onClose,
    onDelete,
    onNavigateToNode,
    flowNodes = [],
    flowEdges = [],
  } = props

  const dragDropMathNodeData = nodeData as GameDragDropMathNodeData

  const prevEdge = flowEdges.find((edge) => edge.target === nodeId)
  const nextEdge = flowEdges.find((edge) => edge.source === nodeId)
  const prevNode = prevEdge
    ? { id: prevEdge.source, nodeType: flowNodes.find((node) => node.id === prevEdge.source)?.type }
    : undefined
  const nextNode = nextEdge
    ? { id: nextEdge.target, nodeType: flowNodes.find((node) => node.id === nextEdge.target)?.type }
    : undefined

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
          <DnDMathEditor
            nodeId={nodeId}
            nodeData={nodeData}
            onPatchNodeData={onPatchNodeData}
          />
        }
        previewContent={
          <DnDMathPreview
            nodeId={nodeId}
            nodeData={dragDropMathNodeData}
          />
        }
        settingsContent={
          <DnDMathSettings
            nodeId={nodeId}
            onDelete={onDelete}
            onClose={onClose}
            onNavigateToNode={onNavigateToNode}
            onPatchNodeData={onPatchNodeData}
            nodeData={dragDropMathNodeData}
            prevNode={prevNode}
            nextNode={nextNode}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
