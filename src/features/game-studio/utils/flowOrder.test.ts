import { describe, expect, it } from 'vitest'
import type { Edge, Node } from '@xyflow/react'

import { getOrderedPlayableNodes } from './flowOrder'

function node(id: string, type: string): Node {
  return { id, type, position: { x: 0, y: 0 }, data: {} }
}

function edge(source: string, target: string): Edge {
  return { id: `${source}->${target}`, source, target }
}

describe('getOrderedPlayableNodes', () => {
  it('returns every gameplay node type in flow order from Start', () => {
    const nodes = [
      node('start', 'gameStart'),
      node('pin', 'gameImagePin'),
      node('math', 'gameDragDropMath'),
      node('open', 'gameOpenQuestion'),
      node('end', 'gameEnd'),
    ]
    const edges = [
      edge('start', 'pin'),
      edge('pin', 'math'),
      edge('math', 'open'),
      edge('open', 'end'),
    ]

    const ordered = getOrderedPlayableNodes(nodes, edges)

    expect(ordered.map((n) => n.id)).toEqual(['pin', 'math', 'open'])
  })

  it('excludes non-gameplay flow nodes (start, end, if/else)', () => {
    const nodes = [
      node('start', 'gameStart'),
      node('branch', 'gameIfElse'),
      node('open', 'gameOpenQuestion'),
      node('end', 'gameEnd'),
    ]
    const edges = [edge('start', 'branch'), edge('branch', 'open'), edge('open', 'end')]

    const ordered = getOrderedPlayableNodes(nodes, edges)

    expect(ordered.map((n) => n.type)).toEqual(['gameOpenQuestion'])
  })

  it('excludes gameplay nodes not reachable from Start', () => {
    const nodes = [
      node('start', 'gameStart'),
      node('pin', 'gameImagePin'),
      node('orphan', 'gameDragDropMath'),
      node('end', 'gameEnd'),
    ]
    const edges = [edge('start', 'pin'), edge('pin', 'end')]

    const ordered = getOrderedPlayableNodes(nodes, edges)

    expect(ordered.map((n) => n.id)).toEqual(['pin'])
  })

  it('falls back to all gameplay nodes when there is no Start node', () => {
    const nodes = [node('pin', 'gameImagePin'), node('open', 'gameOpenQuestion')]

    const ordered = getOrderedPlayableNodes(nodes, [])

    expect(ordered.map((n) => n.id).sort()).toEqual(['open', 'pin'])
  })
})
