import { Square } from 'lucide-react'
import type { GameNodeRegistryEntry } from '../_registry/game-node-registry.types'
import { GameEndNode } from './GameEndNode'
import { GameEndDialog } from './GameEndDialog'
import { GAME_END_TYPE, gameEndDefaultConfig, validateGameEndConfig } from './game-end.schema'

export const gameEndEntry: GameNodeRegistryEntry = {
  type: GAME_END_TYPE,
  label: 'End',
  category: 'nodes',
  accent: 'gray',
  Icon: Square,
  NodeComponent: GameEndNode,
  DialogComponent: GameEndDialog,
  defaultConfig: gameEndDefaultConfig,
  validateConfig: validateGameEndConfig,
  isDeletable: true,
  allowMultiple: false,
  isDraggable: true,
}

export { GameEndNode } from './GameEndNode'
export { GameEndDialog } from './GameEndDialog'
export type { GameEndNodeData } from './game-end.schema'
