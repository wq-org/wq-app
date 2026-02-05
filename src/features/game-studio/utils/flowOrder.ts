import type { Node, Edge } from '@xyflow/react'

const PLAYABLE_NODE_TYPES = ['gameParagraph', 'gameImageTerms', 'gameImagePin'] as const

function isPlayableType(type: string | undefined): type is (typeof PLAYABLE_NODE_TYPES)[number] {
  return type != null && PLAYABLE_NODE_TYPES.includes(type as (typeof PLAYABLE_NODE_TYPES)[number])
}

/**
 * Returns playable game nodes in flow order: from start node, following edges.
 * Only nodes with type gameParagraph, gameImageTerms, or gameImagePin are included.
 */
export function getOrderedPlayableNodes(nodes: Node[], edges: Edge[]): Node[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const outEdges = new Map<string, Edge[]>()
  for (const e of edges) {
    const list = outEdges.get(e.source) ?? []
    list.push(e)
    outEdges.set(e.source, list)
  }

  const startNode = nodes.find((n) => n.type === 'gameStart')
  if (!startNode) {
    return nodes.filter((n) => isPlayableType(n.type))
  }

  const ordered: Node[] = []
  const visited = new Set<string>()
  const queue: string[] = [startNode.id]

  while (queue.length > 0) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    const node = byId.get(id)
    if (node && isPlayableType(node.type)) {
      ordered.push(node)
    }
    const next = outEdges.get(id) ?? []
    for (const e of next) {
      if (!visited.has(e.target)) queue.push(e.target)
    }
  }

  return ordered
}
