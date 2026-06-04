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

export type AdjacentBranchNode = { id: string; nodeType: string | undefined }

export function getOutgoingBranchNode(
  ifElseNodeId: string,
  branch: GameIfElseCorrectPath,
  nodes: Node[],
  edges: Edge[],
): AdjacentBranchNode | undefined {
  const handle = branch === 'A' ? IF_ELSE_HANDLE_A : IF_ELSE_HANDLE_B
  const edge = edges.find(
    (outgoing) => outgoing.source === ifElseNodeId && (outgoing.sourceHandle ?? '') === handle,
  )
  if (!edge) return undefined
  const target = nodes.find((node) => node.id === edge.target)
  if (!target) return undefined
  return { id: target.id, nodeType: target.type }
}
