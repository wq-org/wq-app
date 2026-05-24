import type { SerializedEditorState } from 'lexical'

import type { MathNodeVariant } from './math-node.types'
import type { MathTokenRole } from './math-token-role.types'
import type { MathTokenShellState } from './math-token-shell.types'

export type DragDropMathCanvasToken = {
  id: string
  value: string
  variant: MathNodeVariant
  /** Math row layout: equation (editable) · equals · result (fixed). */
  mathRole?: MathTokenRole
  /** Frozen on canvas: not editable or draggable. */
  disabled?: boolean
  /** Math tokens only: `error` on equation; `ghost` on result badge. */
  mathShell?: MathTokenShellState
  /** Equation token: last committed expression (re-shown when editing). */
  expression?: string
}

export type DragDropMathCanvasRow = {
  id: string
  /** Rows are homogeneous: every token in `tokens` shares this variant. */
  variant: MathNodeVariant
  tokens: DragDropMathCanvasToken[]
}

export type GameDragDropMathNodeData = {
  label?: string
  title?: string
  /** Rich description (Lexical JSON), autosaved on the canvas node. */
  descriptionContent?: SerializedEditorState | null
  /** Token rows placed on the drag-drop math canvas. */
  canvasRows?: DragDropMathCanvasRow[]
  /** Max total score this node can award. */
  points?: number
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

/** Shell node — validation deferred until authoring UI exists. */
export function validateGameDragDropMathConfig(data: unknown): string[] {
  void data
  return []
}
