import type { DragDropMathCanvasRow } from './drag-drop-math.schema'

export type DragDropMathExerciseTab = {
  id: string
  title: string
  canvasRows: DragDropMathCanvasRow[]
}
