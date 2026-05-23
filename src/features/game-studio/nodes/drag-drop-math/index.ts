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
  isDraggable: true,
  featureKey: GAME_FEATURE_KEY_DRAG_DROP_MATH,
}

export { GameDragDropMathDialog } from './GameDragDropMathDialog'
export { GameDragDropMathNode } from './GameDragDropMathNode'
export { MathNode } from './MathNode'
export { MathTextNode } from './MathTextNode'
export { DropMathNode } from './DropMathNode'
export { DropTextNode } from './DropTextNode'
export { MathNodeDemo } from './MathNodeDemo'
export { MathNodeSingleLineShell } from './MathNodeSingleLineShell'
export { MathNodeInlineSentence, MathNodeSentenceText } from './MathNodeInlineSentence'
export type { MathNodeProps } from './MathNode'
export type { MathTextNodeProps } from './MathTextNode'
export type { DropMathNodeProps } from './DropMathNode'
export type { MathTokenCommitPayload } from './useMathDropNodeEditor'
export type { MathTokenShellState } from './math-token-shell.types'
export type { DropTextNodeProps } from './DropTextNode'
export type { MathNodeVariant } from './math-node.types'
export type { DropNodeVisualState } from './drop-node.types'
export { MathNodeMathChrome } from './MathNodeMathChrome'
export type { MathNodeSingleLineShellProps } from './MathNodeSingleLineShell'
export type {
  MathNodeInlineSentenceProps,
  MathNodeSentenceTextProps,
} from './MathNodeInlineSentence'
export type {
  DragDropMathCanvasRow,
  DragDropMathCanvasToken,
  GameDragDropMathNodeData,
} from './drag-drop-math.schema'
export { DragDropMathCanvas } from './canvas'
