import type { Node } from '@xyflow/react'

export type GraphIssueCode =
  | 'start.missing'
  | 'start.duplicate'
  | 'start.noOutgoing'
  | 'end.missing'
  | 'end.duplicate'
  | 'end.hasOutgoing'
  | 'game.missing'
  | 'edge.sourceMissing'
  | 'edge.targetMissing'
  | 'edge.selfLoop'
  | 'flow.endUnreachable'
  | 'flow.notReachableFromStart'
  | 'flow.cannotReachEnd'
  | 'ifElse.branch.missing'

export type GraphIssue = {
  code: GraphIssueCode
  nodeId?: string
  edgeId?: string
  params?: Record<string, string | number>
}

export type NodeReachabilityIssue = {
  nodeId: string
  notReachableFromStart: boolean
  cannotReachEnd: boolean
}

export type GraphValidationResult = {
  canPublish: boolean
  issues: GraphIssue[]
  nodeReachabilityIssues: NodeReachabilityIssue[]
  reachableFromStart: ReadonlySet<string>
  reachableToEnd: ReadonlySet<string>
  validFlowNodeIds: ReadonlySet<string>
}

export type FlowAdjacencyMaps = {
  nodeById: Map<string, Node>
  outgoingBySource: Map<string, string[]>
  incomingByTarget: Map<string, string[]>
}
