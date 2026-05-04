import type { Node, Edge } from '@xyflow/react'
import { GAME_END_TYPE } from '../nodes/game-end/game-end.schema'
import { GAME_IF_ELSE_TYPE } from '../nodes/game-if-else/game-if-else.schema'
import { GAME_IMAGE_PIN_TYPE } from '../nodes/game-image-pin/game-image-pin.schema'
import { GAME_START_TYPE } from '../nodes/game-start/game-start.schema'
import { validateNodeConfig } from '../nodes/_registry/GameNodeRegistry'

const GAME_NODE_TYPES = [GAME_IMAGE_PIN_TYPE, GAME_IF_ELSE_TYPE] as const

export function getNodeLabel(node: Node): string {
  const d = node.data as Record<string, unknown> | undefined
  const label = (d?.label ?? d?.title ?? node.id) as string
  return typeof label === 'string' && label.trim() ? label : node.id
}

export function getReachableFromStart(nodes: Node[], edges: Edge[]): Set<string> {
  const start = nodes.find((n) => n.type === GAME_START_TYPE)
  if (!start) return new Set()
  const out = new Set<string>()
  const queue: string[] = [start.id]
  while (queue.length) {
    const id = queue.shift()!
    if (out.has(id)) continue
    out.add(id)
    edges.filter((e) => e.source === id).forEach((e) => queue.push(e.target))
  }
  return out
}

export function getReachableToEnd(nodes: Node[], edges: Edge[]): Set<string> {
  const end = nodes.find((n) => n.type === GAME_END_TYPE)
  if (!end) return new Set()
  const out = new Set<string>()
  const queue: string[] = [end.id]
  while (queue.length) {
    const id = queue.shift()!
    if (out.has(id)) continue
    out.add(id)
    edges.filter((e) => e.target === id).forEach((e) => queue.push(e.source))
  }
  return out
}

/** Per-node validation — delegates to the registry entry's validateConfig. */
export function getNodeValidationErrors(node: Node): string[] {
  return validateNodeConfig(node.type, node.data)
}

export interface NodeValidationItem {
  node: Node
  label: string
  errors: string[]
}

export interface ValidationResult {
  nodeItems: NodeValidationItem[]
  globalErrors: string[]
  canPublish: boolean
}

export function getValidationResult(nodes: Node[], edges: Edge[]): ValidationResult {
  const globalErrors: string[] = []
  const startNode = nodes.find((n) => n.type === GAME_START_TYPE)
  const endNode = nodes.find((n) => n.type === GAME_END_TYPE)
  const gameNodes = nodes.filter(
    (n) => n.type && (GAME_NODE_TYPES as readonly string[]).includes(n.type),
  )

  if (!startNode) globalErrors.push('At least one Start node is required')
  if (gameNodes.length === 0) {
    globalErrors.push('At least one game node (Image Pin or If/Else) is required')
  }
  if (!endNode) globalErrors.push('At least one End node is required')

  if (startNode && endNode && nodes.length > 0) {
    const fromStart = getReachableFromStart(nodes, edges)
    const toEnd = getReachableToEnd(nodes, edges)
    const disconnected: string[] = []
    nodes.forEach((n) => {
      if (!fromStart.has(n.id) || !toEnd.has(n.id)) disconnected.push(getNodeLabel(n))
    })
    if (disconnected.length) {
      globalErrors.push(`Disconnected nodes (must link Start to End): ${disconnected.join(', ')}`)
    }
  }

  const nodeItems: NodeValidationItem[] = nodes.map((node) => ({
    node,
    label: getNodeLabel(node),
    errors: getNodeValidationErrors(node),
  }))

  const hasNodeErrors = nodeItems.some((item) => item.errors.length > 0)
  const canPublish = globalErrors.length === 0 && !hasNodeErrors

  return { nodeItems, globalErrors, canPublish }
}

/** Get points contribution from a single node. Uses flattened node.data. */
export function getPointsForNode(node: Node): number {
  const type = node.type
  const data = node.data as Record<string, unknown> | undefined
  if (!type || !(GAME_NODE_TYPES as readonly string[]).includes(type)) return 0
  if (typeof data?.points === 'number' && data.points >= 0) return data.points
  if (type === GAME_IMAGE_PIN_TYPE && data) {
    const squares = Array.isArray(data.squares) ? data.squares : []
    return squares.reduce(
      (s: number, sq: Record<string, unknown>) =>
        s + (typeof sq.points === 'number' && sq.points > 0 ? sq.points : 1),
      0,
    )
  }
  return 100
}

export function getDisplayNameForNodeType(type: string | undefined): string {
  switch (type) {
    case GAME_START_TYPE:
      return 'Start'
    case GAME_END_TYPE:
      return 'End Node'
    case GAME_IMAGE_PIN_TYPE:
      return 'Image and Pin'
    case GAME_IF_ELSE_TYPE:
      return 'If/Else'
    default:
      return type ?? 'Node'
  }
}
