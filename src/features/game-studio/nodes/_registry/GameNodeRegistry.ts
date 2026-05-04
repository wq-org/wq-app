import type { ComponentType } from 'react'
import type { NodeProps } from '@xyflow/react'

import { gameStartEntry } from '../game-start'
import { gameEndEntry } from '../game-end'
import { gameIfElseEntry } from '../game-if-else'
import { gameImagePinEntry } from '../game-image-pin'
import type { GameNodeCategory, GameNodeRegistryEntry } from './game-node-registry.types'

export const GAME_NODE_REGISTRY: readonly GameNodeRegistryEntry[] = [
  gameStartEntry,
  gameEndEntry,
  gameIfElseEntry,
  gameImagePinEntry,
] as const

const REGISTRY_BY_TYPE = new Map<string, GameNodeRegistryEntry>(
  GAME_NODE_REGISTRY.map((entry) => [entry.type, entry]),
)

export function getRegistryEntry(type: string | undefined): GameNodeRegistryEntry | undefined {
  if (!type) return undefined
  return REGISTRY_BY_TYPE.get(type)
}

/** XYFlow nodeTypes map. Memoize at the call site (e.g. with useMemo). */
export function buildXYFlowNodeTypes(): Record<string, ComponentType<NodeProps>> {
  return Object.fromEntries(GAME_NODE_REGISTRY.map((entry) => [entry.type, entry.NodeComponent]))
}

/** Sidebar items, optionally filtered by category. Hides entries marked non-draggable. */
export function getSidebarEntries(category?: GameNodeCategory): readonly GameNodeRegistryEntry[] {
  return GAME_NODE_REGISTRY.filter(
    (entry) => entry.isDraggable && (category ? entry.category === category : true),
  )
}

/** Per-node validation — delegates to the registry entry. Empty array if type unknown. */
export function validateNodeConfig(type: string | undefined, data: unknown): string[] {
  const entry = getRegistryEntry(type)
  if (!entry) return []
  return entry.validateConfig(data)
}
