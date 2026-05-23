import type { SerializedEditorState } from 'lexical'

import type { MathNodeVariant } from './MathNode'

export type DragDropMathCanvasToken = {
  id: string
  value: string
  variant: MathNodeVariant
  /** Normalized horizontal position on the canvas (0–1). */
  x: number
  /** Normalized vertical position on the canvas (0–1). */
  y: number
}

export type GameDragDropMathNodeData = {
  label?: string
  title?: string
  /** Rich description (Lexical JSON), autosaved on the canvas node. */
  descriptionContent?: SerializedEditorState | null
  /** Tokens placed on the drag-drop math canvas. */
  canvasTokens?: DragDropMathCanvasToken[]
}

export const GAME_DRAG_DROP_MATH_TYPE = 'gameDragDropMath' as const

export const gameDragDropMathDefaultConfig: GameDragDropMathNodeData = {
  label: 'Drag & drop math',
  title: '',
  canvasTokens: [],
}

/** Shell node — validation deferred until authoring UI exists. */
export function validateGameDragDropMathConfig(data: unknown): string[] {
  void data
  return []
}
