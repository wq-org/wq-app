import { Calculator } from 'lucide-react'

import { GAME_FEATURE_KEY_DRAG_DROP_MATH } from '../../constants/gameFeatureKeys'
import type { GameNodeRegistryEntry } from '../_registry/game-node-registry.types'
import { GameDragDropMathDialog } from './GameDragDropMathDialog'
import { GameDragDropMathNode } from './GameDragDropMathNode'
import {
  GAME_DRAG_DROP_MATH_TYPE,
  gameDragDropMathDefaultConfig,
  validateGameDragDropMathConfig,
} from './drag-drop-math.schema'

export const gameDragDropMathEntry: GameNodeRegistryEntry = {
  type: GAME_DRAG_DROP_MATH_TYPE,
  label: 'Drag & drop math',
  category: 'games',
  accent: 'blue',
  Icon: Calculator,
  NodeComponent: GameDragDropMathNode,
  DialogComponent: GameDragDropMathDialog,
  defaultConfig: gameDragDropMathDefaultConfig,
  validateConfig: validateGameDragDropMathConfig,
  isDeletable: true,
  allowMultiple: true,
  isDraggable: false,
  disabled: true,
  featureKey: GAME_FEATURE_KEY_DRAG_DROP_MATH,
}

export { GameDragDropMathDialog } from './GameDragDropMathDialog'
export { GameDragDropMathNode } from './GameDragDropMathNode'
export type { GameDragDropMathNodeData } from './drag-drop-math.schema'
