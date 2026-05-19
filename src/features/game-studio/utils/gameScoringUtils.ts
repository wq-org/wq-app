/** Points per question given a max budget and a question count. */
export function calcPointsPerQuestion(maxPoints: number, questionCount: number): number {
  if (questionCount <= 0 || maxPoints <= 0) return 0
  return Math.floor(maxPoints / questionCount)
}

/**
 * Points earned on attempt N (1-indexed).
 * The factor shrinks by `deductionPercent` for each retry;
 * attempt 4+ always returns 0, matching the settings breakdown table.
 */
export function calcAttemptPoints(
  pointsPerQuestion: number,
  attemptNumber: number,
  deductionPercent: number,
): number {
  if (attemptNumber <= 0 || pointsPerQuestion <= 0) return 0
  const factor = Math.max(0, 1 - ((attemptNumber - 1) * deductionPercent) / 100)
  return Math.max(0, Math.floor(pointsPerQuestion * factor))
}
