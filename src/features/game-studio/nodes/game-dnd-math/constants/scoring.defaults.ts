import type { ScoringConfig, ScoringWeights, ToleranceWindow } from '../types/scoring.types'

export const DEFAULT_SCORING_WEIGHTS = {
  result: 0.5,
  steps: 0.3,
  method: 0.15,
  errorFree: 0.05,
} as const satisfies ScoringWeights

export const R_ONLY_SCORING_WEIGHTS = {
  result: 1,
  steps: 0,
  method: 0,
  errorFree: 0,
} as const satisfies ScoringWeights

export const DEFAULT_TOLERANCE = {
  abs: 0.01,
  rel: 0.001,
} as const satisfies ToleranceWindow

export const DEFAULT_SCORING_CONFIG = {
  weights: DEFAULT_SCORING_WEIGHTS,
  mode: 'carry',
  tolerance: DEFAULT_TOLERANCE,
  graceful: false,
} as const satisfies ScoringConfig

export const R_ONLY_SCORING_CONFIG = {
  ...DEFAULT_SCORING_CONFIG,
  weights: R_ONLY_SCORING_WEIGHTS,
} as const satisfies ScoringConfig
