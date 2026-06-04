import type { SerializedEditorState } from 'lexical'

import type { MathTokenRole } from './math-token-role.types'
import type { MathTokenShellState } from './math-token-shell.types'
import type { DragDropMathExerciseTab } from './exercise-tab.types'
import type { SigmaCanvasRow } from './sigma-row.types'

export type { DragDropMathExerciseTab } from './exercise-tab.types'

/** Canvas pill variants — sigma lives on {@link SigmaCanvasRow}, not in `tokens[]`. */
export type TokenCanvasVariant = 'math' | 'text'

export function isTokenCanvasVariant(value: unknown): value is TokenCanvasVariant {
  return value === 'math' || value === 'text'
}

export type DragDropMathCanvasToken = {
  id: string
  value: string
  variant: TokenCanvasVariant
  /** Math row layout: equation (editable) · equals · result (fixed). */
  mathRole?: MathTokenRole
  /** Frozen on canvas: not editable or draggable. */
  disabled?: boolean
  /** Math tokens only: `error` / `success` on equation; `ghost` on result badge. */
  mathShell?: MathTokenShellState
  /** Equation token: raw user input (re-shown when editing). */
  expression?: string
}

export type TokenCanvasRow = {
  id: string
  variant: TokenCanvasVariant
  tokens: DragDropMathCanvasToken[]
}

export type DragDropMathCanvasRow = TokenCanvasRow | SigmaCanvasRow

export function isSigmaCanvasRow(row: DragDropMathCanvasRow): row is SigmaCanvasRow {
  return row.variant === 'sigma'
}

export function isTokenCanvasRow(row: DragDropMathCanvasRow): row is TokenCanvasRow {
  return row.variant === 'math' || row.variant === 'text'
}

export type GameDragDropMathNodeData = {
  label?: string
  /** @deprecated Use {@link exerciseTabs} — migrated on read. */
  title?: string
  /** Rich description (Lexical JSON), autosaved on the canvas node. */
  descriptionContent?: SerializedEditorState | null
  /** @deprecated Use {@link exerciseTabs} — migrated on read. */
  canvasRows?: DragDropMathCanvasRow[]
  /** Isolated exercise workspaces (title + canvas per tab). */
  exerciseTabs?: DragDropMathExerciseTab[]
  activeExerciseTabId?: string
  /** Max total score this node can award. */
  points?: number
  /** Blue/red equation chip on Enter. Omit or `true` = enabled; `false` = off. */
  instantColorFeedback?: boolean
}

export const GAME_DRAG_DROP_MATH_TYPE = 'gameDragDropMath' as const
export const GAME_DRAG_DROP_MATH_DEFAULT_POINTS = 10

export const gameDragDropMathDefaultConfig: GameDragDropMathNodeData = {
  label: 'Drag & drop math',
  title: '',
  canvasRows: [],
  points: GAME_DRAG_DROP_MATH_DEFAULT_POINTS,
}

export function resolveGameDragDropMathPoints(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : GAME_DRAG_DROP_MATH_DEFAULT_POINTS
}

/** Shell node — delegates to publish validator. */
export { validateGameDragDropMathConfig } from '../utils/validateGameDragDropMathPublish'
