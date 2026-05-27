import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MessageCircleQuestion } from 'lucide-react'
import { GameNodeLayout } from '../../../components/GameNodeLayout'
import type { GameOpenQuestionNodeData } from '../types/open-question.schema'

type CanvasData = GameOpenQuestionNodeData & { onClick?: () => void }

export function OpenQuestionNode({ data, selected }: NodeProps) {
  const d = (data ?? {}) as CanvasData
  return (
    <GameNodeLayout
      Icon={MessageCircleQuestion}
      accent="blue"
      label={d.label ?? d.title ?? 'Open question'}
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
