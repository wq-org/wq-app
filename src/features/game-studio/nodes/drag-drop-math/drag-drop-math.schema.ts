export type GameDragDropMathNodeData = {
  label?: string
  title?: string
}

export const GAME_DRAG_DROP_MATH_TYPE = 'gameDragDropMath' as const

export const gameDragDropMathDefaultConfig: GameDragDropMathNodeData = {
  label: 'Drag & drop math',
  title: '',
}

/** Shell node — validation deferred until authoring UI exists. */
export function validateGameDragDropMathConfig(data: unknown): string[] {
  void data
  return []
}
