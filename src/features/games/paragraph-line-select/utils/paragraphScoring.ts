import { applyPenalty } from '../../utils/scoring'
import type {
  SentenceConfig,
  QuestionResult,
  QuestionResultStatus,
} from '@/features/games/paragraph-line-select/types'

export type { QuestionResult, QuestionResultStatus }
export type { SentenceConfig } from '@/features/games/paragraph-line-select/types'

const STATEMENT_TRUNCATE_LENGTH = 60

export function hasMultipleCorrectOptions(config: SentenceConfig): boolean {
  return config.options.filter((o) => o.isCorrect).length > 1
}

export function getQuestionMaxPoints(config: SentenceConfig): number {
  const sum = config.options.filter((o) => o.isCorrect).reduce((s, o) => s + (o.points ?? 0), 0)
  return sum > 0 ? sum : (config.pointsWhenCorrect ?? 0)
}

export function getQuestionResult(config: SentenceConfig, selectedIds: string[]): QuestionResult {
  const correctOptions = config.options.filter((o) => o.isCorrect)
  const max = getQuestionMaxPoints(config)
  const maxPerOption = correctOptions.reduce((sum, o) => sum + (o.points ?? 0), 0)
  const pointsPerCorrect = correctOptions.length > 0 ? max / correctOptions.length : 0

  if (selectedIds.length === 0) {
    return { status: 'false', earned: 0, max, correctEarned: 0, penaltyApplied: 0 }
  }

  const correctSelectedIds = selectedIds.filter((id) => {
    const opt = config.options.find((o) => o.id === id)
    return opt?.isCorrect ?? false
  })
  const correctSelected = correctSelectedIds.length
  const hasWrong = selectedIds.some((id) => {
    const opt = config.options.find((o) => o.id === id)
    return opt?.isCorrect === false
  })

  const correctEarned =
    maxPerOption > 0
      ? correctSelectedIds.reduce(
          (sum, id) => sum + (config.options.find((o) => o.id === id)?.points ?? 0),
          0,
        )
      : correctSelected * pointsPerCorrect

  const selectedWrongOptions = config.options.filter(
    (o) => !o.isCorrect && selectedIds.includes(o.id),
  )
  const penaltySum = selectedWrongOptions.reduce((s, o) => s + (o.pointsWhenWrong ?? 0), 0)
  const earned = applyPenalty(correctEarned, penaltySum)

  if (hasWrong) {
    return { status: 'false', earned, max, correctEarned, penaltyApplied: penaltySum }
  }
  if (correctSelected === 0) {
    return { status: 'false', earned: 0, max, correctEarned: 0, penaltyApplied: penaltySum }
  }

  const numCorrect = correctOptions.length
  const multi = hasMultipleCorrectOptions(config)
  if (multi) {
    if (correctSelected === numCorrect) {
      return { status: 'correct', earned, max, correctEarned, penaltyApplied: 0 }
    }
    return { status: 'partly correct', earned, max, correctEarned, penaltyApplied: 0 }
  }

  return { status: 'correct', earned, max, correctEarned, penaltyApplied: 0 }
}

export interface ParagraphResultRow {
  key: number
  statementText: string
  statementTruncated: string
  selectedAnswerTexts: string[]
  earned: number
  max: number
  feedback: string
  feedbackVariant: 'correct' | 'wrong'
}

export function computeParagraphResults(
  sentenceConfigs: SentenceConfig[],
  getSelectedIds: (sentenceNumber: number) => string[],
): { rows: ParagraphResultRow[]; totalEarned: number; totalMax: number } {
  const configsWithOptions = sentenceConfigs.filter((c) => c.options.length > 0)
  if (configsWithOptions.length === 0) {
    return { rows: [], totalEarned: 0, totalMax: 0 }
  }

  let totalCorrectEarned = 0
  let totalPenaltyApplied = 0
  let totalMax = 0

  const rows: ParagraphResultRow[] = configsWithOptions.map((config) => {
    const sentenceNumber = config.sentenceNumber
    const selectedIds = getSelectedIds(sentenceNumber)

    const result = getQuestionResult(config, selectedIds)
    totalCorrectEarned += result.correctEarned ?? result.earned
    totalPenaltyApplied += result.penaltyApplied ?? 0
    totalMax += result.max

    const statementTruncated =
      config.sentenceText.length > STATEMENT_TRUNCATE_LENGTH
        ? `${config.sentenceText.slice(0, STATEMENT_TRUNCATE_LENGTH)}…`
        : config.sentenceText
    const selectedAnswerTexts = selectedIds
      .map((id) => config.options.find((o) => o.id === id)?.text ?? '')
      .filter(Boolean)
    const feedback =
      result.status === 'false'
        ? (config.feedbackWhenWrong ?? '')
        : (config.feedbackWhenCorrect ?? '')
    const feedbackVariant: 'correct' | 'wrong' = result.status === 'false' ? 'wrong' : 'correct'

    return {
      key: config.sentenceNumber,
      statementText: config.sentenceText,
      statementTruncated,
      selectedAnswerTexts,
      earned: result.earned,
      max: result.max,
      feedback,
      feedbackVariant,
    }
  })

  const totalEarned = applyPenalty(totalCorrectEarned, totalPenaltyApplied)
  return { rows, totalEarned, totalMax }
}
