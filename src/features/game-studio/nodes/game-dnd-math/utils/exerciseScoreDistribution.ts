const SCORE_SHARE_SCALE = 10

export type DnDMathExerciseScoreShare = {
  index: number
  maxScore: number
}

function toScoreUnits(score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0
  return Math.round(score * SCORE_SHARE_SCALE)
}

function fromScoreUnits(units: number): number {
  return units / SCORE_SHARE_SCALE
}

export function formatDnDMathScore(value: number): string {
  const rounded = fromScoreUnits(toScoreUnits(value))
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function resolveDnDMathExerciseScoreShares(
  totalMaxScore: number,
  exerciseCount: number,
): DnDMathExerciseScoreShare[] {
  const count = Math.max(0, Math.floor(exerciseCount))
  if (count === 0) return []

  const totalUnits = toScoreUnits(totalMaxScore)
  const baseUnits = Math.floor(totalUnits / count)
  const remainderUnits = totalUnits % count

  return Array.from({ length: count }, (_, index) => ({
    index,
    maxScore: fromScoreUnits(baseUnits + (index < remainderUnits ? 1 : 0)),
  }))
}
