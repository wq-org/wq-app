import type { Edge, Node } from '@xyflow/react'

import type { FlowAdjacencyMaps } from '../../types/graph-validation.types'

export function buildFlowAdjacencyMaps(nodes: Node[], edges: Edge[]): FlowAdjacencyMaps {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const outgoingBySource = new Map<string, string[]>()
  const incomingByTarget = new Map<string, string[]>()

  for (const edge of edges) {
    const outgoing = outgoingBySource.get(edge.source) ?? []
    outgoing.push(edge.target)
    outgoingBySource.set(edge.source, outgoing)

    const incoming = incomingByTarget.get(edge.target) ?? []
    incoming.push(edge.source)
    incomingByTarget.set(edge.target, incoming)
  }

  return { nodeById, outgoingBySource, incomingByTarget }
}
