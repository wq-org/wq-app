import { describe, expect, it } from 'vitest'
import type { Edge, Node } from '@xyflow/react'

import {
  getDefaultIfElseScoreThreshold,
  getIfElseRoutingScoreContribution,
  getIfElseBranchPointRanges,
  getIncomingGameplayNode,
  getOutgoingBranchEdge,
  getOutgoingBranchNode,
  resolveGameplayNodeMaxPoints,
  resolveIfElseBranchFromScore,
} from './game-if-else.utils'
import { IF_ELSE_HANDLE_A, IF_ELSE_HANDLE_B } from './game-if-else.schema'

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

describe('getIfElseRoutingScoreContribution', () => {
  it('does not count the incoming score twice when If/Else mounts after a finished node', () => {
    expect(getIfElseRoutingScoreContribution(40, 40)).toBe(0)
  })

  it('counts the incoming score normally when the If/Else preview plays the incoming node itself', () => {
    expect(getIfElseRoutingScoreContribution(40, undefined)).toBe(40)
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

describe('getOutgoingBranchEdge', () => {
  const ifElseId = 'if-1'

  it('matches branch A and B by source handle', () => {
    const edges = [edge(ifElseId, 'a', IF_ELSE_HANDLE_A), edge(ifElseId, 'b', IF_ELSE_HANDLE_B)]
    expect(getOutgoingBranchEdge(ifElseId, 'A', edges)?.target).toBe('a')
    expect(getOutgoingBranchEdge(ifElseId, 'B', edges)?.target).toBe('b')
  })

  it('falls back to the only outgoing edge when sourceHandle is missing', () => {
    const edges = [edge(ifElseId, 'only')]
    expect(getOutgoingBranchEdge(ifElseId, 'A', edges)?.target).toBe('only')
    expect(getOutgoingBranchEdge(ifElseId, 'B', edges)?.target).toBe('only')
  })

  it('maps two handle-less edges to A first and B second by stable id order', () => {
    const edges = [edge(ifElseId, 'z'), edge(ifElseId, 'a')]
    expect(getOutgoingBranchEdge(ifElseId, 'A', edges)?.target).toBe('a')
    expect(getOutgoingBranchEdge(ifElseId, 'B', edges)?.target).toBe('z')
  })
})

describe('getOutgoingBranchNode', () => {
  it('returns the target gameplay node for the resolved branch', () => {
    const nodes = [
      node('if-1', 'gameIfElse'),
      node('oq-a', 'gameOpenQuestion', { label: 'Node A' }),
    ]
    const edges = [edge('if-1', 'oq-a', IF_ELSE_HANDLE_A)]
    expect(getOutgoingBranchNode('if-1', 'A', nodes, edges)).toEqual({
      id: 'oq-a',
      nodeType: 'gameOpenQuestion',
    })
  })
})
