export interface VotingOption {
  id: string
  text: string
  isCorrect: boolean
  /** Points for this option when correct; only used when isCorrect is true. */
  points?: number
}

export interface SentenceConfig {
  sentenceNumber: number
  sentenceText: string
  options: VotingOption[]
  pointsWhenCorrect?: number
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
}

export interface ParagraphLineSelectGameProps {
  initialData?: unknown
  onDelete?: () => void
}
