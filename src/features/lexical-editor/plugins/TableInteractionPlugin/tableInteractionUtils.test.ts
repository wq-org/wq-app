import { describe, expect, it } from 'vitest'

import { getInsertionIndexAfterRemoval } from './tableActions'
import { computeDropIndex } from './tableInteractionUtils'

/** Simulates moveColumn's reorder on a plain array (remove, then splice). */
function applyMove<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
  position: 'before' | 'after',
): T[] {
  const next = [...items]
  const [moving] = next.splice(fromIndex, 1)
  const insertionIndex = getInsertionIndexAfterRemoval(fromIndex, toIndex, position)
  next.splice(Math.max(0, Math.min(insertionIndex, next.length)), 0, moving)
  return next
}

describe('computeDropIndex', () => {
  // Two columns, 100px wide each → midpoints at 50 and 150.
  const midpoints = [50, 150]

  it('returns the first slot when the pointer is left of every midpoint', () => {
    expect(computeDropIndex(midpoints, 10, 0)).toBe(0)
  })

  it('returns the index of the first midpoint right of the pointer', () => {
    expect(computeDropIndex(midpoints, 120, 0)).toBe(1)
  })

  it('returns the last index when the pointer is right of every midpoint', () => {
    expect(computeDropIndex(midpoints, 999, 0)).toBe(1)
  })

  it('returns 0 for an empty positions array', () => {
    expect(computeDropIndex([], 100, 0)).toBe(0)
  })
})

describe('getInsertionIndexAfterRemoval', () => {
  it('swaps two columns when moving 0 after 1', () => {
    expect(applyMove(['A', 'B'], 0, 1, 'after')).toEqual(['B', 'A'])
  })

  it('moving 0 before 1 is a no-op (slot directly after the moving cell)', () => {
    expect(applyMove(['A', 'B'], 0, 1, 'before')).toEqual(['A', 'B'])
  })

  it('moves a column left: 2 before 0', () => {
    expect(applyMove(['A', 'B', 'C'], 2, 0, 'before')).toEqual(['C', 'A', 'B'])
  })

  it('moves a column right across several: 0 after 2', () => {
    expect(applyMove(['A', 'B', 'C'], 0, 2, 'after')).toEqual(['B', 'C', 'A'])
  })

  it('moves a middle column to the front: 1 before 0', () => {
    expect(applyMove(['A', 'B', 'C'], 1, 0, 'before')).toEqual(['B', 'A', 'C'])
  })

  it('is NOT idempotent — applying the same move twice undoes a swap', () => {
    // Regression guard for the StrictMode double-invoke bug: the move side
    // effect must never run inside a React state updater, because a second
    // application of the same index-based move restores the original order.
    const once = applyMove(['A', 'B'], 0, 1, 'after')
    const twice = applyMove(once, 0, 1, 'after')
    expect(once).toEqual(['B', 'A'])
    expect(twice).toEqual(['A', 'B'])
  })
})
