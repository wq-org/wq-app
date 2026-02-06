import type { Node, Edge } from '@xyflow/react'
import type { FlowGameConfig, SerializableNode, SerializableEdge } from '../types/game-studio.types'

const NON_SERIALIZABLE_KEYS = new Set(['onClick'])

/**
 * Strips non-JSON-serializable fields from node data (e.g. onClick handlers).
 */
function serializableData(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (NON_SERIALIZABLE_KEYS.has(key)) continue
    if (typeof value === 'function') continue
    out[key] = value
  }
  return out
}

/**
 * Builds a FlowGameConfig from current canvas state for persistence.
 */
export function serializeFlowGameConfig(
  nodes: Node[],
  edges: Edge[],
  projectVersion = '1.0',
): FlowGameConfig {
  const serializableNodes: SerializableNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.type ?? 'default',
    position: node.position ?? { x: 0, y: 0 },
    data: serializableData((node.data as Record<string, unknown>) ?? {}),
  }))

  const serializableEdges: SerializableEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? null,
  }))

  return {
    projectVersion,
    nodes: serializableNodes,
    edges: serializableEdges,
  }
}

/**
 * Default flow config for a new project (single Start node).
 */
export function getDefaultFlowGameConfig(): FlowGameConfig {
  return {
    projectVersion: '1.0',
    nodes: [
      {
        id: 'start-1',
        type: 'gameStart',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      },
    ],
    edges: [],
  }
}
