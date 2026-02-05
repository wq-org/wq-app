export interface Term {
  id: string
  value: string
  /** Whether this term is a correct answer; multiple terms can be correct. */
  isCorrect?: boolean
  /** Points for this term when correct; only used when isCorrect is true. */
  points?: number
  /** Wrong-answer penalty (applied when this term is selected but is incorrect). */
  pointsWhenWrong?: number
  /** Feedback shown after Check when this correct term is part of the selection. */
  feedbackWhenCorrect?: string
  /** Feedback shown after Check when this incorrect term is selected. */
  feedbackWhenWrong?: string
}

export interface ImageTermMatchGameProps {
  initialData?: unknown
  onDelete?: () => void
  /** Called when user removes the image and it was stored at this path (so caller can delete from storage). */
  onRemoveImage?: (path: string) => void | Promise<void>
  /** When true, only the playable preview content is rendered (no editor/settings tabs). */
  previewOnly?: boolean
}

export interface ImageTermMatchGameData {
  title: string | null
  description: string | null
  filepath: string | null
  imagePreview: string | null
  terms: Term[]
}

export interface Term {
  id: string
  value: string
}

export interface ImageTermMatchGameData {
  title: string | null
  description: string | null
  feedbackText: string | null
  filepath: string | null
  imagePreview: string | null
  answers: Array<{
    id: string
    value: string
    isCorrect: boolean
  }>
  correctAnswerId: string | null
}
