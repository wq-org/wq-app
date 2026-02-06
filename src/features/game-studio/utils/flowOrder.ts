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

/** Handle ID for If/Else node: A = top, B = bottom */
const IF_ELSE_HANDLE_A = 'right-top'
const IF_ELSE_HANDLE_B = 'right-bottom'

export interface PreviewPathResult {
  startNode: Node | null
  /** Nodes in the preview path between Start and End (playable + logic). */
  pathNodes: Node[]
  endNode: Node | null
}

/**
 * Returns one path from Start to End for preview, respecting If/Else branching.
 * At each gameIfElse node, follows the edge whose sourceHandle matches correctPath
 * ('A' → right-top, 'B' → right-bottom). Other nodes: follow the single outgoing edge.
 */
const PREVIEW_NODE_TYPES = [
  'gameParagraph',
  'gameImageTerms',
  'gameImagePin',
  'gameIfElse',
] as const

function isPreviewType(type: string | undefined): type is (typeof PREVIEW_NODE_TYPES)[number] {
  return type != null && PREVIEW_NODE_TYPES.includes(type as (typeof PREVIEW_NODE_TYPES)[number])
}

export function getPreviewPath(nodes: Node[], edges: Edge[]): PreviewPathResult {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const outEdges = new Map<string, Edge[]>()
  for (const e of edges) {
    const list = outEdges.get(e.source) ?? []
    list.push(e)
    outEdges.set(e.source, list)
  }

  const startNode = nodes.find((n) => n.type === 'gameStart') ?? null
  const endNode = nodes.find((n) => n.type === 'gameEnd') ?? null

  if (!startNode || !endNode) {
    return { startNode, pathNodes: [], endNode }
  }

  const pathNodes: Node[] = []
  let currentId: string = startNode.id
  const visited = new Set<string>()

  while (currentId !== endNode.id) {
    if (visited.has(currentId)) break
    visited.add(currentId)

    const node = byId.get(currentId)
    const nextEdges = outEdges.get(currentId) ?? []

    if (node && isPreviewType(node.type)) {
      pathNodes.push(node)
    }

    if (nextEdges.length === 0) break

    let nextEdge: Edge | null = null
    if (node?.type === 'gameIfElse') {
      const correctPath = (node.data as Record<string, unknown>)?.correctPath as
        | 'A'
        | 'B'
        | undefined
      const wantHandle = correctPath === 'B' ? IF_ELSE_HANDLE_B : IF_ELSE_HANDLE_A
      nextEdge = nextEdges.find((e) => (e.sourceHandle ?? '') === wantHandle) ?? nextEdges[0]
    } else {
      nextEdge = nextEdges[0]
    }

    if (!nextEdge) break
    currentId = nextEdge.target
  }

  return { startNode, pathNodes, endNode }
}
