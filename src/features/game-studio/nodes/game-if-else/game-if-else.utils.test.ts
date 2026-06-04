import { describe, expect, it } from 'vitest'
import type { Edge, Node } from '@xyflow/react'

import {
  getDefaultIfElseScoreThreshold,
  getIfElseBranchPointRanges,
  getIncomingGameplayNode,
  resolveGameplayNodeMaxPoints,
  resolveIfElseBranchFromScore,
} from './game-if-else.utils'

function node(id: string, type: string, data: Record<string, unknown> = {}): Node {
  return { id, type, position: { x: 0, y: 0 }, data }
}

function edge(source: string, target: string, sourceHandle?: string): Edge {
  return {
    id: `${source}->${target}`,
    source,
    target,
    ...(sourceHandle ? { sourceHandle } : {}),
  }
}

describe('getDefaultIfElseScoreThreshold', () => {
  it('returns half of max points floored', () => {
    expect(getDefaultIfElseScoreThreshold(100)).toBe(50)
    expect(getDefaultIfElseScoreThreshold(7)).toBe(3)
  })

  it('returns 0 when max points is not positive', () => {
    expect(getDefaultIfElseScoreThreshold(0)).toBe(0)
    expect(getDefaultIfElseScoreThreshold(-5)).toBe(0)
  })
})

describe('getIfElseBranchPointRanges', () => {
  it('formats A and B ranges from threshold and max points', () => {
    expect(getIfElseBranchPointRanges(50, 100)).toEqual({
      branchA: { min: 50, max: 100 },
      branchB: { min: 0, max: 49 },
    })
  })

  it('returns null B range when threshold is zero', () => {
    expect(getIfElseBranchPointRanges(0, 100)).toEqual({
      branchA: { min: 0, max: 100 },
      branchB: null,
    })
  })
})

describe('resolveIfElseBranchFromScore', () => {
  it('routes to B below threshold and A at or above', () => {
    expect(resolveIfElseBranchFromScore(4, 5)).toBe('B')
    expect(resolveIfElseBranchFromScore(5, 5)).toBe('A')
    expect(resolveIfElseBranchFromScore(10, 5)).toBe('A')
  })
})

describe('incoming gameplay max points', () => {
  it('reads points from the connected gameplay source node', () => {
    const nodes = [node('pin', 'gameImagePin', { points: 80 }), node('branch', 'gameIfElse')]
    const edges = [edge('pin', 'branch')]

    const incoming = getIncomingGameplayNode('branch', nodes, edges)
    expect(incoming?.id).toBe('pin')
    expect(resolveGameplayNodeMaxPoints(incoming)).toBe(80)
    expect(getDefaultIfElseScoreThreshold(resolveGameplayNodeMaxPoints(incoming))).toBe(40)
  })

  it('ignores non-gameplay incoming nodes', () => {
    const nodes = [node('start', 'gameStart'), node('branch', 'gameIfElse')]
    const edges = [edge('start', 'branch')]

    expect(getIncomingGameplayNode('branch', nodes, edges)).toBeUndefined()
  })
})
