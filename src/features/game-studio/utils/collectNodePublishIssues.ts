import type { Node } from '@xyflow/react'

import { validateNodeConfig } from '../nodes/_registry/GameNodeRegistry'
import type { GraphValidationResult } from '../types/graph-validation.types'
import type { PublishIssue } from '../types/publish-validation.types'
import { isFlowParticipatingNode, getNodeDisplayLabel } from './graph/resolveFlowParticipatingNodes'

function resolveTargetNodeIds(nodes: Node[], graph: GraphValidationResult): Set<string> {
  if (graph.validFlowNodeIds.size > 0) {
    return new Set(graph.validFlowNodeIds)
  }
  return new Set(nodes.filter(isFlowParticipatingNode).map((node) => node.id))
}

export function collectNodePublishIssues(
  nodes: Node[],
  graph: GraphValidationResult,
): PublishIssue[] {
  const targetIds = resolveTargetNodeIds(nodes, graph)
  const issues: PublishIssue[] = []

  for (const node of nodes) {
    if (!targetIds.has(node.id)) continue

    const label = getNodeDisplayLabel(node)
    const nodeIssues = validateNodeConfig(node.type, node.data)

    for (const issue of nodeIssues) {
      issues.push({
        ...issue,
        nodeId: issue.nodeId ?? node.id,
        params: {
          ...issue.params,
          label: issue.params?.label ?? label,
        },
      })
    }
  }

  return issues
}
