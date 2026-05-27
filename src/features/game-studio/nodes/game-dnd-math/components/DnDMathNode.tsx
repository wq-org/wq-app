import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Calculator } from 'lucide-react'
import { GameNodeLayout } from '../../../components/GameNodeLayout'
import type { GameDragDropMathNodeData } from '../types/drag-drop-math.schema'

type CanvasData = GameDragDropMathNodeData & { onClick?: () => void }

export function DnDMathNode({ data, selected }: NodeProps) {
  const d = (data ?? {}) as CanvasData
  return (
    <GameNodeLayout
      Icon={Calculator}
      accent="blue"
      label={d.label ?? d.title ?? 'Drag & drop math'}
      selected={selected}
      onClick={d.onClick}
      handles={
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="w-3! h-3! bg-blue-500! border-2! border-white!"
            id="left"
            onClick={(e) => e.stopPropagation()}
          />
          <Handle
            type="source"
            position={Position.Right}
            className="w-3! h-3! bg-blue-500! border-2! border-white!"
            id="right"
            onClick={(e) => e.stopPropagation()}
          />
        </>
      }
    />
  )
}
