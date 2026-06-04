import type { Node } from '@xyflow/react'

import { isGameplayNodeType } from '../constants/flowGraphNodeTypes'
import { resolveGameplayNodeMaxPoints } from '../nodes/game-if-else/game-if-else.utils'

/** Sum of max achievable points across all gameplay nodes on the canvas (full-game preview cap). */
export function computePlayPreviewSessionMaxScore(nodes: readonly Node[]): number {
  let total = 0
  for (const node of nodes) {
    if (!isGameplayNodeType(node.type)) continue
    total += resolveGameplayNodeMaxPoints(node)
  }
  return total
}

/** Score ring denominator: session total in full-game preview, per-node max otherwise. */
export function resolvePlayPreviewFooterMaxScore(
  nodeMaxScore: number,
  continuousSession: boolean,
  sessionMaxScore?: number,
): number {
  return continuousSession && sessionMaxScore != null ? sessionMaxScore : nodeMaxScore
}
