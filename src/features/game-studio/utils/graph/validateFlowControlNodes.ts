import type { Edge, Node } from '@xyflow/react'

import { GAME_END_TYPE } from '../../nodes/game-end/game-end.schema'
import {
  GAME_IF_ELSE_TYPE,
  IF_ELSE_HANDLE_A,
  IF_ELSE_HANDLE_B,
} from '../../nodes/game-if-else/game-if-else.schema'
import { GAME_START_TYPE } from '../../nodes/game-start/game-start.schema'
import type { GraphIssue } from '../../types/graph-validation.types'
import { getNodeDisplayLabel } from './resolveFlowParticipatingNodes'

export function collectFlowControlNodeIssues(
  nodes: Node[],
  edges: Edge[],
  outgoingBySource: Map<string, string[]>,
): GraphIssue[] {
  const issues: GraphIssue[] = []

  const startNode = nodes.find((node) => node.type === GAME_START_TYPE)
  if (startNode) {
    const outgoing = outgoingBySource.get(startNode.id) ?? []
    if (outgoing.length === 0) {
      issues.push({
        code: 'start.noOutgoing',
        nodeId: startNode.id,
        params: { label: getNodeDisplayLabel(startNode) },
      })
    }
  }

  const endNode = nodes.find((node) => node.type === GAME_END_TYPE)
  if (endNode) {
    const outgoing = outgoingBySource.get(endNode.id) ?? []
    if (outgoing.length > 0) {
      issues.push({
        code: 'end.hasOutgoing',
        nodeId: endNode.id,
        params: { label: getNodeDisplayLabel(endNode) },
      })
    }
  }

  for (const node of nodes) {
    if (node.type !== GAME_IF_ELSE_TYPE) continue

    const branchEdges = edges.filter((edge) => edge.source === node.id)
    const hasHandleA = branchEdges.some((edge) => edge.sourceHandle === IF_ELSE_HANDLE_A)
    const hasHandleB = branchEdges.some((edge) => edge.sourceHandle === IF_ELSE_HANDLE_B)

    if (!hasHandleA || !hasHandleB) {
      issues.push({
        code: 'ifElse.branch.missing',
        nodeId: node.id,
        params: { label: getNodeDisplayLabel(node) },
      })
    }
  }

  return issues
}
