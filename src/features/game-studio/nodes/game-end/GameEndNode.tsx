import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Square } from 'lucide-react'
import { GameNodeLayout } from '../../components/GameNodeLayout'
import type { GameEndNodeData } from './game-end.schema'

type EndCanvasData = GameEndNodeData & { onClick?: () => void }

export function GameEndNode({ data, selected }: NodeProps) {
  const d = (data ?? {}) as EndCanvasData
  return (
    <GameNodeLayout
      Icon={Square}
      accent="gray"
      label={d.title ?? d.label ?? 'End'}
      selected={selected}
      onClick={d.onClick}
      handles={
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-gray-500! border-2! border-white!"
          id="left"
          onClick={(e) => e.stopPropagation()}
        />
      }
    />
  )
}
