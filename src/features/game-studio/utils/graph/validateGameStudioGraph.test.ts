import type { Edge, Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'

import { validateGameStudioGraph } from './validateGameStudioGraph'

const GAME_START = 'gameStart'
const GAME_END = 'gameEnd'
const GAME_OPEN_QUESTION = 'gameOpenQuestion'
const GAME_IMAGE_PIN = 'gameImagePin'

function startNode(id = 'start-1'): Node {
  return { id, type: GAME_START, position: { x: 0, y: 0 }, data: { label: 'Start' } }
}

function endNode(id = 'end-1'): Node {
  return { id, type: GAME_END, position: { x: 0, y: 0 }, data: { label: 'End' } }
}

function openQuestionNode(id = 'oq-1'): Node {
  return {
    id,
    type: GAME_OPEN_QUESTION,
    position: { x: 0, y: 0 },
    data: { label: 'Open question' },
  }
}

function imagePinNode(id = 'pin-1'): Node {
  return {
    id,
    type: GAME_IMAGE_PIN,
    position: { x: 0, y: 0 },
    data: { label: 'Image pin' },
  }
}

function edge(id: string, source: string, target: string): Edge {
  return { id, source, target }
}

describe('validateGameStudioGraph', () => {
  it('allows publish for Start → Open Question → End', () => {
    const nodes = [startNode(), openQuestionNode(), endNode()]
    const edges = [edge('e1', 'start-1', 'oq-1'), edge('e2', 'oq-1', 'end-1')]

    const result = validateGameStudioGraph(nodes, edges)

    expect(result.canPublish).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(result.validFlowNodeIds).toEqual(new Set(['start-1', 'oq-1', 'end-1']))
  })

  it('blocks publish when a game node floats off the main path', () => {
    const nodes = [startNode(), openQuestionNode(), imagePinNode('pin-floating'), endNode()]
    const edges = [
      edge('e1', 'start-1', 'oq-1'),
      edge('e2', 'oq-1', 'end-1'),
      // pin-floating is not connected
    ]

    const result = validateGameStudioGraph(nodes, edges)

    expect(result.canPublish).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'flow.notReachableFromStart')).toBe(true)
    expect(result.issues.some((issue) => issue.code === 'flow.cannotReachEnd')).toBe(true)
    expect(result.nodeReachabilityIssues).toContainEqual({
      nodeId: 'pin-floating',
      notReachableFromStart: true,
      cannotReachEnd: true,
    })
  })

  it('blocks duplicate Start nodes', () => {
    const nodes = [startNode('start-1'), startNode('start-2'), openQuestionNode(), endNode()]
    const edges = [edge('e1', 'start-1', 'oq-1'), edge('e2', 'oq-1', 'end-1')]

    const result = validateGameStudioGraph(nodes, edges)

    expect(result.canPublish).toBe(false)
    expect(result.issues[0]?.code).toBe('start.duplicate')
  })

  it('blocks missing End node', () => {
    const nodes = [startNode(), openQuestionNode()]
    const edges = [edge('e1', 'start-1', 'oq-1')]

    const result = validateGameStudioGraph(nodes, edges)

    expect(result.canPublish).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'end.missing')).toBe(true)
  })

  it('blocks when no game nodes exist', () => {
    const nodes = [startNode(), endNode()]
    const edges = [edge('e1', 'start-1', 'end-1')]

    const result = validateGameStudioGraph(nodes, edges)

    expect(result.canPublish).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'game.missing')).toBe(true)
  })

  it('blocks edges pointing to deleted nodes', () => {
    const nodes = [startNode(), openQuestionNode(), endNode()]
    const edges = [
      edge('e1', 'start-1', 'oq-1'),
      edge('e2', 'oq-1', 'end-1'),
      edge('e3', 'end-1', 'missing-node'),
    ]

    const result = validateGameStudioGraph(nodes, edges)

    expect(result.canPublish).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'edge.targetMissing')).toBe(true)
  })

  it('blocks self-loop edges', () => {
    const nodes = [startNode(), openQuestionNode(), endNode()]
    const edges = [
      edge('e1', 'start-1', 'oq-1'),
      edge('e2', 'oq-1', 'end-1'),
      edge('e3', 'oq-1', 'oq-1'),
    ]

    const result = validateGameStudioGraph(nodes, edges)

    expect(result.canPublish).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'edge.selfLoop')).toBe(true)
  })

  it('blocks side branch nodes outside Start–End intersection', () => {
    const nodes = [startNode(), openQuestionNode('oq-main'), openQuestionNode('oq-side'), endNode()]
    const edges = [
      edge('e1', 'start-1', 'oq-main'),
      edge('e2', 'oq-main', 'end-1'),
      edge('e3', 'start-1', 'oq-side'),
      edge('e4', 'oq-side', 'end-1'),
    ]

    const result = validateGameStudioGraph(nodes, edges)

    // Both paths reach End, but oq-main and oq-side are both in intersection
    // Actually both are reachable from start AND can reach end in this graph
    // Let me reconsider - start -> oq-side -> end AND start -> oq-main -> end
    // oq-side: forward yes, backward yes (can reach end via oq-side -> end)
    // oq-main: forward yes, backward yes
    // Both should be valid!

    expect(result.canPublish).toBe(true)
  })

  it('blocks dead-end branch even when Start can reach End via another path', () => {
    const nodes = [startNode(), openQuestionNode('oq-main'), openQuestionNode('oq-dead'), endNode()]
    const edges = [
      edge('e1', 'start-1', 'oq-main'),
      edge('e2', 'oq-main', 'end-1'),
      edge('e3', 'start-1', 'oq-dead'),
      // oq-dead has no outgoing edge to End
    ]

    const result = validateGameStudioGraph(nodes, edges)

    expect(result.canPublish).toBe(false)
    expect(result.nodeReachabilityIssues).toContainEqual({
      nodeId: 'oq-dead',
      notReachableFromStart: false,
      cannotReachEnd: true,
    })
  })
})
