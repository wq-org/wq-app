import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MapPin } from 'lucide-react'
import { GameNodeLayout } from '../../components/GameNodeLayout'
import type { GameImagePinNodeData } from './game-image-pin.schema'

type ImagePinCanvasData = GameImagePinNodeData & { onClick?: () => void }

export function GameImagePinNode({ data, selected }: NodeProps) {
  const d = (data ?? {}) as ImagePinCanvasData
  return (
    <GameNodeLayout
      Icon={MapPin}
      accent="blue"
      label={d.label ?? d.title ?? 'Image Pin'}
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
