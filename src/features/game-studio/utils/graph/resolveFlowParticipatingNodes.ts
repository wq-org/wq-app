import type { Node } from '@xyflow/react'

import {
  getFlowGraphNodeDisplayLabel,
  isFlowGraphNodeType,
  isGameplayNodeType,
} from '../../constants/flowGraphNodeTypes'

export function isFlowParticipatingNode(node: Node): boolean {
  return isFlowGraphNodeType(node.type)
}

export function isGameplayNode(node: Node): boolean {
  return isGameplayNodeType(node.type)
}

export function getNodeDisplayLabel(node: Node): string {
  return getFlowGraphNodeDisplayLabel(node.type, (node.data ?? {}) as Record<string, unknown>)
}
