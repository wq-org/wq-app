import { Split } from 'lucide-react'
import type { GameNodeRegistryEntry } from '../_registry/game-node-registry.types'
import { GameIfElseNode } from './GameIfElseNode'
import { GameIfElseDialog } from './GameIfElseDialog'
import {
  GAME_IF_ELSE_TYPE,
  gameIfElseDefaultConfig,
  validateGameIfElseConfig,
} from './game-if-else.schema'

export const gameIfElseEntry: GameNodeRegistryEntry = {
  type: GAME_IF_ELSE_TYPE,
  label: 'If / else',
  category: 'logic',
  accent: 'orange',
  Icon: Split,
  NodeComponent: GameIfElseNode,
  DialogComponent: GameIfElseDialog,
  defaultConfig: gameIfElseDefaultConfig,
  validateConfig: validateGameIfElseConfig,
  isDeletable: true,
  allowMultiple: true,
  isDraggable: true,
}

export { GameIfElseNode } from './GameIfElseNode'
export { GameIfElseDialog } from './GameIfElseDialog'
export {
  IF_ELSE_HANDLE_A,
  IF_ELSE_HANDLE_B,
  type GameIfElseNodeData,
  type GameIfElseCorrectPath,
} from './game-if-else.schema'
