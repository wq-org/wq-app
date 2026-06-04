import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Split } from 'lucide-react'

import { GameNodeLayout } from '../../components/GameNodeLayout'
import { IF_ELSE_HANDLE_A, IF_ELSE_HANDLE_B, type GameIfElseNodeData } from './game-if-else.schema'

const MAX_LABEL_LENGTH = 24

const HANDLE_BASE_CLASS = 'w-3! h-3! border-2! border-white!'
const HANDLE_BRANCH_A_CLASS = `${HANDLE_BASE_CLASS} bg-orange-500!`
/** Branch B — below score threshold. */
const HANDLE_BRANCH_B_CLASS = `${HANDLE_BASE_CLASS} bg-muted-foreground!`

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
          <span className="truncate text-xs text-muted-foreground">
            {`Correct route: ${routeLabel}`}
          </span>
        ) : undefined
      }
      handles={
        <>
          <Handle
            type="target"
            position={Position.Left}
            className={HANDLE_BRANCH_A_CLASS}
            id="left"
            onClick={(e) => e.stopPropagation()}
          />
          <Handle
            type="source"
            position={Position.Right}
            className={HANDLE_BRANCH_A_CLASS}
            id={IF_ELSE_HANDLE_A}
            onClick={(e) => e.stopPropagation()}
            style={{ top: '32%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            className={HANDLE_BRANCH_B_CLASS}
            id={IF_ELSE_HANDLE_B}
            onClick={(e) => e.stopPropagation()}
            style={{ top: '68%' }}
          />
        </>
      }
    />
  )
}
