/**
 * Shared scoring helpers and types for game features.
 * Single place for "score never below zero" rule (Clean Code: DRY, single responsibility).
 */

export interface GameScoreSummary {
  correct: number
  wrong: number
  score: number
}

/** Ensures score is never negative. */
export function clampScore(earned: number): number {
  return Math.max(0, earned)
}

/** Applies penalty to correct earned points; result is never negative. */
export function applyPenalty(correctEarned: number, penaltySum: number): number {
  return clampScore(correctEarned - penaltySum)
}
