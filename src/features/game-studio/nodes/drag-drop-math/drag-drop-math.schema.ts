import type { SerializedEditorState } from 'lexical'

import type { MathNodeVariant } from './math-node.types'

export type DragDropMathCanvasToken = {
  id: string
  value: string
  variant: MathNodeVariant
  /** Frozen on canvas: not editable or draggable. */
  disabled?: boolean
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
}

export const GAME_DRAG_DROP_MATH_TYPE = 'gameDragDropMath' as const

export const gameDragDropMathDefaultConfig: GameDragDropMathNodeData = {
  label: 'Drag & drop math',
  title: '',
  canvasRows: [],
}

/** Shell node — validation deferred until authoring UI exists. */
export function validateGameDragDropMathConfig(data: unknown): string[] {
  void data
  return []
}
