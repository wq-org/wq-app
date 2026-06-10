import type { Edge, Node } from '@xyflow/react'

import { getOrderedPlayableNodes, type SessionResultsByNode } from '@/features/game-studio'

/**
 * Merges live session results with unplayed nodes so session_payload clearly
 * records which segments were never reached (played: false).
 */
export function buildLeaveSessionResults(
  nodes: Node[],
  edges: Edge[],
  currentResults: SessionResultsByNode,
): SessionResultsByNode {
  const ordered = getOrderedPlayableNodes(nodes, edges)
  const next: SessionResultsByNode = { ...currentResults }

  for (const node of ordered) {
    const existing = next[node.id]
    if (existing) {
      next[node.id] = { ...existing, played: true }
      continue
    }

    next[node.id] = {
      score: 0,
      correct: 0,
      wrong: 0,
      outcome: 'wrong',
      played: false,
    }
  }

  return next
}
