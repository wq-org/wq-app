export interface VotingOption {
  id: string
  text: string
  isCorrect: boolean
  /** Points for this option when correct; only used when isCorrect is true. */
  points?: number
  /** Penalty (stored as non-negative, e.g. 20 → applied as -20); only used when isCorrect is false. */
  pointsWhenWrong?: number
}

export interface SentenceConfig {
  sentenceNumber: number
  sentenceText: string
  options: VotingOption[]
  pointsWhenCorrect?: number
  /** Shown after Check when the answer is correct (or partly correct). */
  feedbackWhenCorrect?: string
  /** Shown after Check when the answer is false. */
  feedbackWhenWrong?: string
}

export interface SelectedAnswer {
  sentenceNumber: number
  optionId: string
}

export interface ParagraphGameInitialData {
  title?: string
  description?: string
  paragraphText?: string
  sentenceConfigs?: SentenceConfig[]
}

export type QuestionResultStatus = 'correct' | 'partly correct' | 'false'

export interface QuestionResult {
  status: QuestionResultStatus
  earned: number
  max: number
  /** Points earned from correct options only (before penalty). Used for overall total. */
  correctEarned?: number
  /** Penalty applied for wrong selections. Used for overall total. */
  penaltyApplied?: number
}

export interface ParagraphLineSelectGameProps {
  initialData?: unknown
  onDelete?: () => void
  /** When true, only the playable preview content is rendered (no editor/settings tabs). */
  previewOnly?: boolean
}
