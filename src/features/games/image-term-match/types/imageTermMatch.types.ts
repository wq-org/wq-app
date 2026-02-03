export interface Term {
  id: string
  value: string
  /** Whether this term is a correct answer; multiple terms can be correct. */
  isCorrect?: boolean
  /** Points for this term when correct; only used when isCorrect is true. */
  points?: number
  /** Wrong-answer penalty (applied when this term is selected but is incorrect). */
  pointsWhenWrong?: number
}

export interface ImageTermMatchGameProps {
  initialData?: unknown
  onDelete?: () => void
}

export interface ImageTermMatchGameData {
  title: string | null
  description: string | null
  filepath: string | null
  imagePreview: string | null
  terms: Term[]
  /** Feedback shown after Check when the answer is correct. */
  feedbackWhenCorrect?: string
  /** Feedback shown after Check when the answer is wrong. */
  feedbackWhenWrong?: string
}
