import type { Edge, Node } from '@xyflow/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../nodes/_registry/GameNodeRegistry', () => ({
  validateNodeConfig: (type: string | undefined, data: unknown) => {
    if (type === 'gameOpenQuestion') {
      const questions = (data as { questions?: unknown[] }).questions
      if (!Array.isArray(questions) || questions.length === 0) {
        return [{ code: 'openQuestion.prompt.missing', severity: 'error' as const }]
      }
    }

    return []
  },
}))

import { getPublishValidationResult } from './publishValidation'

function startNode(data: Record<string, unknown> = { label: 'Start', title: 'Start' }): Node {
  return { id: 'start-1', type: 'gameStart', position: { x: 0, y: 0 }, data }
}

function endNode(): Node {
  return { id: 'end-1', type: 'gameEnd', position: { x: 0, y: 0 }, data: { label: 'End' } }
}

function openQuestionNode(data: Record<string, unknown>): Node {
  return { id: 'oq-1', type: 'gameOpenQuestion', position: { x: 0, y: 0 }, data }
}

function edge(id: string, source: string, target: string): Edge {
  return { id, source, target }
}

describe('getPublishValidationResult', () => {
  it('allows publish when graph and node content are valid', () => {
    const nodes = [
      startNode(),
      openQuestionNode({ label: 'Open question', questions: [{ id: 'q1' }] }),
      endNode(),
    ]
    const edges = [edge('e1', 'start-1', 'oq-1'), edge('e2', 'oq-1', 'end-1')]

    const result = getPublishValidationResult(nodes, edges)

    expect(result.canPublish).toBe(true)
    expect(result.issues.filter((issue) => issue.severity === 'error')).toHaveLength(0)
  })

  it('blocks publish when graph is valid but node content is incomplete', () => {
    const nodes = [
      startNode(),
      openQuestionNode({ label: 'Open question', questions: [] }),
      endNode(),
    ]
    const edges = [edge('e1', 'start-1', 'oq-1'), edge('e2', 'oq-1', 'end-1')]

    const result = getPublishValidationResult(nodes, edges)

    expect(result.canPublish).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'openQuestion.prompt.missing')).toBe(true)
  })
})
