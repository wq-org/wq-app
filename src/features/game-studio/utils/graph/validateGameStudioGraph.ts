import type { Edge, Node } from '@xyflow/react'

import { GAME_END_TYPE } from '../../nodes/game-end/game-end.schema'
import { GAME_START_TYPE } from '../../nodes/game-start/game-start.schema'
import type {
  GraphIssue,
  GraphValidationResult,
  NodeReachabilityIssue,
} from '../../types/graph-validation.types'
import { buildFlowAdjacencyMaps } from './buildFlowAdjacencyMaps'
import { collectReachableNodeIds } from './collectReachableNodeIds'
import {
  getNodeDisplayLabel,
  isFlowParticipatingNode,
  isGameplayNode,
} from './resolveFlowParticipatingNodes'
import { collectFlowControlNodeIssues } from './validateFlowControlNodes'

function intersectSets(a: ReadonlySet<string>, b: ReadonlySet<string>): Set<string> {
  const result = new Set<string>()
  for (const id of a) {
    if (b.has(id)) result.add(id)
  }
  return result
}

function collectCardinalityIssues(nodes: Node[]): GraphIssue[] {
  const issues: GraphIssue[] = []
  const startNodes = nodes.filter((node) => node.type === GAME_START_TYPE)
  const endNodes = nodes.filter((node) => node.type === GAME_END_TYPE)
  const gameNodes = nodes.filter(isGameplayNode)

  if (startNodes.length === 0) {
    issues.push({ code: 'start.missing' })
  } else if (startNodes.length > 1) {
    issues.push({ code: 'start.duplicate', params: { count: startNodes.length } })
  }

  if (endNodes.length === 0) {
    issues.push({ code: 'end.missing' })
  } else if (endNodes.length > 1) {
    issues.push({ code: 'end.duplicate', params: { count: endNodes.length } })
  }

  if (gameNodes.length === 0) {
    issues.push({ code: 'game.missing' })
  }

  return issues
}

function collectEdgeSanityIssues(edges: Edge[], nodeById: Map<string, Node>): GraphIssue[] {
  const issues: GraphIssue[] = []

  for (const edge of edges) {
    const sourceExists = nodeById.has(edge.source)
    const targetExists = nodeById.has(edge.target)

    if (!sourceExists) {
      issues.push({ code: 'edge.sourceMissing', edgeId: edge.id, nodeId: edge.source })
    }
    if (!targetExists) {
      issues.push({ code: 'edge.targetMissing', edgeId: edge.id, nodeId: edge.target })
    }
    if (sourceExists && targetExists && edge.source === edge.target) {
      issues.push({
        code: 'edge.selfLoop',
        edgeId: edge.id,
        nodeId: edge.source,
        params: { label: getNodeDisplayLabel(nodeById.get(edge.source)!) },
      })
    }
  }

  return issues
}

function collectFlowMembershipIssues(
  nodes: Node[],
  reachableFromStart: ReadonlySet<string>,
  reachableToEnd: ReadonlySet<string>,
): { issues: GraphIssue[]; nodeReachabilityIssues: NodeReachabilityIssue[] } {
  const issues: GraphIssue[] = []
  const nodeReachabilityIssues: NodeReachabilityIssue[] = []

  for (const node of nodes) {
    if (!isFlowParticipatingNode(node)) continue

    const notReachableFromStart = !reachableFromStart.has(node.id)
    const cannotReachEnd = !reachableToEnd.has(node.id)

    if (!notReachableFromStart && !cannotReachEnd) continue

    nodeReachabilityIssues.push({
      nodeId: node.id,
      notReachableFromStart,
      cannotReachEnd,
    })

    const label = getNodeDisplayLabel(node)
    if (notReachableFromStart) {
      issues.push({
        code: 'flow.notReachableFromStart',
        nodeId: node.id,
        params: { label },
      })
    }
    if (cannotReachEnd) {
      issues.push({
        code: 'flow.cannotReachEnd',
        nodeId: node.id,
        params: { label },
      })
    }
  }

  return { issues, nodeReachabilityIssues }
}

export function validateGameStudioGraph(nodes: Node[], edges: Edge[]): GraphValidationResult {
  const emptyReachability = new Set<string>()
  const { nodeById, outgoingBySource, incomingByTarget } = buildFlowAdjacencyMaps(nodes, edges)

  const cardinalityIssues = collectCardinalityIssues(nodes)
  const edgeIssues = collectEdgeSanityIssues(edges, nodeById)
  const controlIssues = collectFlowControlNodeIssues(nodes, edges, outgoingBySource)
  const structuralIssues = [...cardinalityIssues, ...edgeIssues, ...controlIssues]

  if (structuralIssues.length > 0) {
    return {
      canPublish: false,
      issues: structuralIssues,
      nodeReachabilityIssues: [],
      reachableFromStart: emptyReachability,
      reachableToEnd: emptyReachability,
      validFlowNodeIds: emptyReachability,
    }
  }

  const startNode = nodes.find((node) => node.type === GAME_START_TYPE)!
  const endNode = nodes.find((node) => node.type === GAME_END_TYPE)!

  const reachableFromStart = collectReachableNodeIds(startNode.id, outgoingBySource)
  const reachableToEnd = collectReachableNodeIds(endNode.id, incomingByTarget)
  const validFlowNodeIds = intersectSets(reachableFromStart, reachableToEnd)

  const flowIssues: GraphIssue[] = []

  if (!reachableFromStart.has(endNode.id)) {
    flowIssues.push({ code: 'flow.endUnreachable' })
  }

  const { issues: membershipIssues, nodeReachabilityIssues } = collectFlowMembershipIssues(
    nodes,
    reachableFromStart,
    reachableToEnd,
  )

  const issues = [...flowIssues, ...membershipIssues]

  return {
    canPublish: issues.length === 0,
    issues,
    nodeReachabilityIssues,
    reachableFromStart,
    reachableToEnd,
    validFlowNodeIds,
  }
}
