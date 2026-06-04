import { describe, expect, it } from 'vitest'
import type { Node } from '@xyflow/react'

import { computePlayPreviewSessionMaxScore } from './playPreviewSessionScore'

function node(id: string, type: string, data: Record<string, unknown> = {}): Node {
  return { id, type, position: { x: 0, y: 0 }, data }
}

describe('computePlayPreviewSessionMaxScore', () => {
  it('sums max points for every gameplay node and ignores flow nodes', () => {
    const nodes = [
      node('start', 'gameStart'),
      node('pin', 'gameImagePin', { points: 10 }),
      node('math', 'gameDragDropMath', { points: 20 }),
      node('oq', 'gameOpenQuestion', { points: 5 }),
      node('branch', 'gameIfElse'),
      node('end', 'gameEnd'),
    ]

    expect(computePlayPreviewSessionMaxScore(nodes)).toBe(35)
  })

  it('returns 0 when there are no gameplay nodes', () => {
    expect(computePlayPreviewSessionMaxScore([node('start', 'gameStart')])).toBe(0)
  })
})
