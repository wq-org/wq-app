import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Split } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { GameNodeLayout } from '../../node-layout/GameNodeLayout'
import { IF_ELSE_HANDLE_A, IF_ELSE_HANDLE_B, type GameIfElseNodeData } from './game-if-else.schema'

const MAX_LABEL_LENGTH = 24

type IfElseCanvasData = GameIfElseNodeData & { onClick?: () => void }

export function GameIfElseNode({ data, selected }: NodeProps) {
  const d = (data ?? {}) as IfElseCanvasData
  const fullLabel = d.label ?? d.title ?? 'If / else'
  const displayLabel =
    fullLabel.length > MAX_LABEL_LENGTH ? `${fullLabel.slice(0, MAX_LABEL_LENGTH)}…` : fullLabel
  const routeLabel = d.correctPath === 'B' ? 'Node B' : d.correctPath === 'A' ? 'Node A' : null

  return (
    <GameNodeLayout
      Icon={Split}
      accent="orange"
      label={displayLabel}
      selected={selected}
      onClick={d.onClick}
      meta={
        routeLabel ? (
          <Text
            as="span"
            variant="small"
            className="text-xs text-gray-500 truncate block"
          >
            Correct route: {routeLabel}
          </Text>
        ) : undefined
      }
      handles={
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white"
            id="left"
            onClick={(e) => e.stopPropagation()}
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white"
            id={IF_ELSE_HANDLE_A}
            onClick={(e) => e.stopPropagation()}
            style={{ top: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white"
            id={IF_ELSE_HANDLE_B}
            onClick={(e) => e.stopPropagation()}
            style={{ top: '70%' }}
          />
        </>
      }
    />
  )
}
