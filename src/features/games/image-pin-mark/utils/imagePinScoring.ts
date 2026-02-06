import { clampScore } from '../../utils/scoring'

const STATEMENT_TRUNCATE_LENGTH = 60

export interface ImagePinSquare {
  id: number
  question?: string
  points?: number
  pointsWhenWrong?: number
  feedbackWhenCorrect?: string
  feedbackWhenWrong?: string
}

export interface ImagePinPosition {
  id: string
  squareId?: number
}

export interface ImagePinRowResult {
  key: number
  statementText: string
  statementTruncated: string
  selectedAnswerTexts: string[]
  earned: number
  max: number
  feedback?: string
  feedbackVariant?: 'correct' | 'wrong'
}

export interface ImagePinResults {
  rows: ImagePinRowResult[]
  totalEarned: number
  totalMax: number
  correct: number
  wrong: number
  score: number
}

export function computeImagePinResults(
  squares: ImagePinSquare[],
  pinPositions: ImagePinPosition[],
): ImagePinResults {
  let totalEarned = 0
  let totalMax = 0
  let correctCount = 0

  const rows: ImagePinRowResult[] = squares.map((square) => {
    const pinId = `pin-${square.id}`
    const pin = pinPositions.find((p) => p.id === pinId)
    const max = square.points != null && square.points > 0 ? square.points : 1
    const correct = pin?.squareId === square.id
    const penalty = square.pointsWhenWrong ?? 0
    const earned = correct ? max : clampScore(-penalty)

    totalEarned += earned
    totalMax += max
    if (correct) correctCount += 1

    const statementText = square.question || 'No question set'
    const statementTruncated =
      statementText.length > STATEMENT_TRUNCATE_LENGTH
        ? `${statementText.slice(0, STATEMENT_TRUNCATE_LENGTH)}…`
        : statementText
    const placementText = pin
      ? correct
        ? 'Correct'
        : 'Wrong square'
      : 'Not placed'
    const feedbackText = correct
      ? square.feedbackWhenCorrect?.trim()
      : square.feedbackWhenWrong?.trim()

    return {
      key: square.id,
      statementText,
      statementTruncated,
      selectedAnswerTexts: [placementText],
      earned,
      max,
      feedback: feedbackText || undefined,
      feedbackVariant: correct ? 'correct' : 'wrong',
    }
  })

  const totalEarnedClamped = clampScore(totalEarned)
  const wrong = squares.length - correctCount

  return {
    rows,
    totalEarned: totalEarnedClamped,
    totalMax,
    correct: correctCount,
    wrong,
    score: totalEarnedClamped,
  }
}
