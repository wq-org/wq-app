import { Play } from 'lucide-react'
import type { GameNodeRegistryEntry } from '../_registry/game-node-registry.types'
import { GameStartNode } from './GameStartNode'
import { GameStartDialog } from './GameStartDialog'
import {
  GAME_START_TYPE,
  gameStartDefaultConfig,
  validateGameStartConfig,
} from './game-start.schema'

export const gameStartEntry: GameNodeRegistryEntry = {
  type: GAME_START_TYPE,
  label: 'Start',
  category: 'nodes',
  accent: 'gray',
  Icon: Play,
  NodeComponent: GameStartNode,
  DialogComponent: GameStartDialog,
  defaultConfig: gameStartDefaultConfig,
  validateConfig: validateGameStartConfig,
  isDeletable: false,
  allowMultiple: false,
  isDraggable: false,
}

export { GameStartNode } from './GameStartNode'
export { GameStartDialog } from './GameStartDialog'
export type { GameStartNodeData } from './game-start.schema'
