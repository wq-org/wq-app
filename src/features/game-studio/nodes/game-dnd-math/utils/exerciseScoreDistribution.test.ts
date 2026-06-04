import { describe, expect, it } from 'vitest'

import { formatDnDMathScore, resolveDnDMathExerciseScoreShares } from './exerciseScoreDistribution'

describe('DnD Math exercise score distribution', () => {
  it('splits uneven max points into one-decimal shares that preserve the total', () => {
    const shares = resolveDnDMathExerciseScoreShares(10, 3)

    expect(shares.map((share) => share.maxScore)).toEqual([3.4, 3.3, 3.3])
    expect(shares.reduce((sum, share) => sum + share.maxScore, 0)).toBeCloseTo(10, 1)
  })

  it('keeps exact splits simple', () => {
    const shares = resolveDnDMathExerciseScoreShares(12, 3)

    expect(shares.map((share) => share.maxScore)).toEqual([4, 4, 4])
  })

  it('returns no shares when there are no exercises', () => {
    expect(resolveDnDMathExerciseScoreShares(10, 0)).toEqual([])
  })

  it('formats whole and decimal scores for preview copy', () => {
    expect(formatDnDMathScore(4)).toBe('4')
    expect(formatDnDMathScore(3.35)).toBe('3.4')
  })
})
