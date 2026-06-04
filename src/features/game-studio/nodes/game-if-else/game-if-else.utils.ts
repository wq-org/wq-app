import type { Edge, Node } from '@xyflow/react'

import { isGameplayNodeType } from '../../constants/flowGraphNodeTypes'
import { resolveGameDragDropMathPoints } from '../game-dnd-math/types/drag-drop-math.schema'
import { resolveGameImagePinPoints } from '../game-image-pin/image-pin.schema'
import { resolveGameOpenQuestionPoints } from '../open-question/utils/openQuestionPoints'
import {
  IF_ELSE_HANDLE_A,
  IF_ELSE_HANDLE_B,
  type GameIfElseCorrectPath,
} from './game-if-else.schema'

export function getIncomingEdgeToNode(nodeId: string, edges: Edge[]): Edge | undefined {
  return edges.find((edge) => edge.target === nodeId)
}

/** Gameplay node directly connected into this node's target handle. */
export function getIncomingGameplayNode(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
): Node | undefined {
  const incomingEdge = getIncomingEdgeToNode(nodeId, edges)
  if (!incomingEdge) return undefined
  const source = nodes.find((node) => node.id === incomingEdge.source)
  if (!source || !isGameplayNodeType(source.type)) return undefined
  return source
}

export function resolveGameplayNodeMaxPoints(node: Node | undefined): number {
  if (!node?.type) return 0
  const data = (node.data ?? {}) as Record<string, unknown>
  switch (node.type) {
    case 'gameImagePin':
      return resolveGameImagePinPoints(data.points)
    case 'gameDragDropMath':
      return resolveGameDragDropMathPoints(data.points)
    case 'gameOpenQuestion':
      return resolveGameOpenQuestionPoints(data.points)
    default:
      return 0
  }
}

/** Default threshold: half of the incoming node's max achievable score (floored). */
export function getDefaultIfElseScoreThreshold(maxPoints: number): number {
  if (!Number.isFinite(maxPoints) || maxPoints <= 0) return 0
  return Math.floor(maxPoints / 2)
}

/**
 * Score-based branch: below threshold → B (bottom / "down"), at or above → A (top / "up").
 */
export function resolveIfElseBranchFromScore(
  score: number,
  threshold: number,
): GameIfElseCorrectPath {
  return score < threshold ? 'B' : 'A'
}

export type IfElseBranchPointRange = { min: number; max: number } | null

/** Display ranges for beam map labels (A: at/above threshold, B: below threshold). */
export function getIfElseBranchPointRanges(
  threshold: number,
  maxPoints: number,
): { branchA: IfElseBranchPointRange; branchB: IfElseBranchPointRange } {
  const t = Math.max(0, Math.floor(threshold))
  const max = Math.max(0, Math.floor(maxPoints))
  if (max <= 0) {
    return { branchA: null, branchB: null }
  }
  const branchA: IfElseBranchPointRange = t > max ? null : { min: Math.min(t, max), max }
  const branchB: IfElseBranchPointRange =
    t <= 0 ? null : { min: 0, max: Math.min(max, Math.max(0, t - 1)) }
  return { branchA, branchB }
}

export type AdjacentBranchNode = { id: string; nodeType: string | undefined }

/** Outgoing edge for branch A (right-top) or B (right-bottom), with legacy fallbacks when sourceHandle is missing. */
export function getOutgoingBranchEdge(
  ifElseNodeId: string,
  branch: GameIfElseCorrectPath,
  edges: Edge[],
): Edge | undefined {
  const handle = branch === 'A' ? IF_ELSE_HANDLE_A : IF_ELSE_HANDLE_B
  const outgoing = edges.filter((edge) => edge.source === ifElseNodeId)
  const byHandle = outgoing.find((edge) => (edge.sourceHandle ?? '') === handle)
  if (byHandle) return byHandle

  if (outgoing.length === 1) return outgoing[0]

  const withoutHandle = outgoing.filter((edge) => !(edge.sourceHandle ?? '').trim())
  if (withoutHandle.length === outgoing.length && outgoing.length === 2) {
    const sorted = [...outgoing].sort((a, b) => a.id.localeCompare(b.id))
    return branch === 'A' ? sorted[0] : sorted[1]
  }

  return undefined
}

export function getOutgoingBranchNode(
  ifElseNodeId: string,
  branch: GameIfElseCorrectPath,
  nodes: Node[],
  edges: Edge[],
): AdjacentBranchNode | undefined {
  const edge = getOutgoingBranchEdge(ifElseNodeId, branch, edges)
  if (!edge) return undefined
  const target = nodes.find((node) => node.id === edge.target)
  if (!target) return undefined
  return { id: target.id, nodeType: target.type }
}
