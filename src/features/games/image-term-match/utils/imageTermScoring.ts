import { applyPenalty } from '../../utils/scoring'
import type { Term } from '@/features/games/image-term-match/types'

const STATEMENT_TRUNCATE_LENGTH = 60

export interface ImageTermResult {
  correct: number
  wrong: number
  score: number
  earned: number
  max: number
  isFullyCorrect: boolean
  hasWrongSelection: boolean
  statementText: string
  statementTruncated: string
  selectedAnswerTexts: string[]
  feedbackText: string | undefined
  feedbackVariant: 'correct' | 'wrong' | undefined
}

export function computeImageTermResults(
  terms: Term[],
  selectedTermIds: string[],
  pointsWhenCorrect: number,
): ImageTermResult {
  const correctEarned = selectedTermIds.reduce((sum, id) => {
    const term = terms.find((t) => t.id === id)
    if (!term?.isCorrect) return sum
    const pts = term.points != null && term.points > 0 ? term.points : 1
    return sum + pts
  }, 0)
  const penaltySum = selectedTermIds.reduce((sum, id) => {
    const term = terms.find((t) => t.id === id)
    if (term?.isCorrect) return sum
    return sum + (term?.pointsWhenWrong ?? 0)
  }, 0)
  const earned = applyPenalty(correctEarned, penaltySum)

  const hasWrongSelection = selectedTermIds.some((id) => {
    const term = terms.find((t) => t.id === id)
    return term != null && !term.isCorrect
  })
  const isFullyCorrect =
    selectedTermIds.length > 0 &&
    selectedTermIds.every((id) => terms.find((t) => t.id === id)?.isCorrect)

  const correct = isFullyCorrect ? 1 : 0
  const wrong = 1 - correct

  const selectedTexts = selectedTermIds
    .map((id) => terms.find((t) => t.id === id)?.value ?? '')
    .filter(Boolean)
  const statementText = selectedTexts.join(', ')
  const statementTruncated =
    statementText.length > STATEMENT_TRUNCATE_LENGTH
      ? `${statementText.slice(0, STATEMENT_TRUNCATE_LENGTH)}…`
      : statementText

  const firstCorrectSelected = selectedTermIds.find(
    (id) => terms.find((t) => t.id === id)?.isCorrect,
  )
  const firstWrongSelected = selectedTermIds.find((id) => {
    const t = terms.find((x) => x.id === id)
    return t != null && !t.isCorrect
  })
  const feedbackText = isFullyCorrect
    ? (terms.find((t) => t.id === firstCorrectSelected)?.feedbackWhenCorrect?.trim() ?? undefined)
    : hasWrongSelection
      ? (terms.find((t) => t.id === firstWrongSelected)?.feedbackWhenWrong?.trim() ?? undefined)
      : undefined
  const feedbackVariant: 'correct' | 'wrong' | undefined = isFullyCorrect
    ? 'correct'
    : hasWrongSelection
      ? 'wrong'
      : undefined

  return {
    correct,
    wrong,
    score: earned,
    earned,
    max: pointsWhenCorrect,
    isFullyCorrect,
    hasWrongSelection,
    statementText,
    statementTruncated,
    selectedAnswerTexts: selectedTexts,
    feedbackText,
    feedbackVariant,
  }
}
