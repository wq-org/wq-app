import { Handle, Position } from '@xyflow/react'
import { Square } from 'lucide-react'
import type { GameEndNodeProps } from '../types/game-studio.types'
import { Text } from '@/components/ui/text'

export default function GameEndNode({ data, selected }: GameEndNodeProps) {
  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 bg-white rounded-3xl min-w-[180px] cursor-pointer hover:shadow-md transition-shadow ${selected ? 'border-2 border-gray-300' : ''}`}
      onClick={data?.onClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-500 !border-2 !border-white"
        id="left"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="p-2 rounded-lg border border-gray-500/20 bg-gray-500/10 flex items-center justify-center">
        <Square className="w-4 h-4 text-gray-500" />
      </div>
      <Text as="span" variant="small" className="text-gray-900 font-medium">{data?.label || 'End'}</Text>
    </div>
  )
}