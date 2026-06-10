import type { Edge, Node } from '@xyflow/react'

import { isGameplayNodeType, isFlowGraphNodeType } from '../constants/flowGraphNodeTypes'
import { GAME_END_TYPE } from '../nodes/game-end/game-end.schema'
import { GAME_START_TYPE } from '../nodes/game-start/game-start.schema'
import { GAME_IF_ELSE_TYPE } from '../nodes/game-if-else/game-if-else.schema'
import { getOutgoingBranchEdge } from '../nodes/game-if-else/game-if-else.utils'
import type { GameIfElseCorrectPath } from '../nodes/game-if-else/game-if-else.schema'
import type { SessionNodeResult, SessionResultsByNode } from '../utils/flowOrder'

export type PlayPreviewSegment =
  | { id: string; kind: 'gameplay'; node: Node }
  | { id: string; kind: 'ifElse'; node: Node }

function buildOutEdges(edges: Edge[]): Map<string, Edge[]> {
  const out = new Map<string, Edge[]>()
  for (const edge of edges) {
    const list = out.get(edge.source) ?? []
    list.push(edge)
    out.set(edge.source, list)
  }
  return out
}

function pickNextEdge(edges: Edge[]): Edge | undefined {
  if (edges.length === 0) return undefined
  if (edges.length === 1) return edges[0]
  return [...edges].sort((a, b) => a.id.localeCompare(b.id))[0]
}

/** First playable or If/Else node reachable from Start (one hop). */
export function getFirstPlayPreviewSegment(
  nodes: Node[],
  edges: Edge[],
): PlayPreviewSegment | null {
  const start = nodes.find((n) => n.type === GAME_START_TYPE)
  if (!start) return null

  const out = buildOutEdges(edges)
  const firstEdge = pickNextEdge(out.get(start.id) ?? [])
  if (!firstEdge) return null

  const target = nodes.find((n) => n.id === firstEdge.target)
  if (!target) return null
  if (target.type === GAME_IF_ELSE_TYPE) {
    return { id: target.id, kind: 'ifElse', node: target }
  }
  if (isGameplayNodeType(target.type)) {
    return { id: target.id, kind: 'gameplay', node: target }
  }
  return null
}

export function toSessionNodeResult(
  score: number,
  maxPoints: number,
  ifElseBranch?: GameIfElseCorrectPath,
): SessionNodeResult {
  const outcome = maxPoints > 0 && score >= maxPoints / 2 ? 'correct' : 'wrong'
  return {
    score,
    outcome,
    correct: outcome === 'correct' ? 1 : 0,
    wrong: outcome === 'correct' ? 0 : 1,
    played: true,
    ...(ifElseBranch ? { ifElseBranch } : {}),
  }
}

/**
 * After a segment completes, returns the next top-level preview segment id/kind, or `end`, or null.
 */
export function resolveNextPlayPreviewSegment(
  completedNodeId: string,
  nodes: Node[],
  edges: Edge[],
  results: SessionResultsByNode,
): PlayPreviewSegment | 'end' | null {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const completed = byId.get(completedNodeId)
  if (!completed) return null

  const out = buildOutEdges(edges)
  const result = results[completedNodeId]

  let nextNodeId: string | undefined

  if (completed.type === GAME_IF_ELSE_TYPE && result?.ifElseBranch) {
    const branchEdge = getOutgoingBranchEdge(completedNodeId, result.ifElseBranch, edges)
    const branchTargetId = branchEdge?.target
    if (!branchTargetId) return 'end'
    const branchOut = pickNextEdge(out.get(branchTargetId) ?? [])
    nextNodeId = branchOut?.target ?? branchTargetId
  } else {
    const nextEdge = pickNextEdge(out.get(completedNodeId) ?? [])
    nextNodeId = nextEdge?.target
  }

  while (nextNodeId) {
    const next = byId.get(nextNodeId)
    if (!next) return null
    if (next.type === GAME_END_TYPE) return 'end'
    if (next.type === GAME_IF_ELSE_TYPE) {
      return { id: next.id, kind: 'ifElse', node: next }
    }
    if (isGameplayNodeType(next.type)) {
      return { id: next.id, kind: 'gameplay', node: next }
    }
    if (!isFlowGraphNodeType(next.type)) return null
    const hop = pickNextEdge(out.get(nextNodeId) ?? [])
    nextNodeId = hop?.target
  }

  return 'end'
}
