import { Calculator } from 'lucide-react'

import { GAME_FEATURE_KEY_DRAG_DROP_MATH } from '../../constants/gameFeatureKeys'
import type { GameNodeRegistryEntry } from '../_registry/game-node-registry.types'
import { GameDragDropMathDialog, GameDragDropMathNode } from './components'
import {
  GAME_DRAG_DROP_MATH_TYPE,
  gameDragDropMathDefaultConfig,
  validateGameDragDropMathConfig,
} from './types/drag-drop-math.schema'

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

export {
  GameDragDropMathDialog,
  GameDragDropMathNode,
  MathNode,
  MathTextNode,
  DropMathNode,
  DropTextNode,
  MathNodeDemo,
  MathNodeSingleLineShell,
  MathNodeInlineSentence,
  MathNodeSentenceText,
  MathNodeMathChrome,
  DragDropMathCanvas,
} from './components'
export type {
  MathNodeProps,
  MathTextNodeProps,
  DropMathNodeProps,
  DropTextNodeProps,
  MathNodeSingleLineShellProps,
  MathNodeInlineSentenceProps,
  MathNodeSentenceTextProps,
} from './components'
export type { MathTokenCommitPayload } from './hooks'
export type { MathTokenShellState, MathNodeVariant, DropNodeVisualState } from './types'
export type {
  DragDropMathCanvasRow,
  DragDropMathCanvasToken,
  GameDragDropMathNodeData,
} from './types'
export type {
  StepOperator,
  ScoringMode,
  StepRef,
  StepOperand,
  StepNode,
  StudentNotation,
  StudentStep,
  ScoringWeights,
  ToleranceWindow,
  ScoringConfig,
  StepBreakdown,
  PscaResult,
} from './types'
export {
  GAME_DRAG_DROP_MATH_TYPE,
  gameDragDropMathDefaultConfig,
  validateGameDragDropMathConfig,
  GAME_DRAG_DROP_MATH_DEFAULT_POINTS,
  resolveGameDragDropMathPoints,
} from './types'
export {
  DEFAULT_SCORING_WEIGHTS,
  R_ONLY_SCORING_WEIGHTS,
  DEFAULT_TOLERANCE,
  DEFAULT_SCORING_CONFIG,
  R_ONLY_SCORING_CONFIG,
} from './constants/scoring.defaults'
export { pscaScore } from './utils/scoring'
