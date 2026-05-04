import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Play } from 'lucide-react'
import { GameNodeLayout } from '../../node-layout/GameNodeLayout'
import type { GameStartNodeData } from './game-start.schema'

type StartCanvasData = GameStartNodeData & { onClick?: () => void }

export function GameStartNode({ data, selected }: NodeProps) {
  const d = (data ?? {}) as StartCanvasData
  return (
    <GameNodeLayout
      Icon={Play}
      accent="gray"
      label={d.title ?? d.label ?? 'Start'}
      selected={selected}
      onClick={d.onClick}
      handles={
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-gray-500 !border-2 !border-white"
          id="right"
          onClick={(e) => e.stopPropagation()}
        />
      }
    />
  )
}
