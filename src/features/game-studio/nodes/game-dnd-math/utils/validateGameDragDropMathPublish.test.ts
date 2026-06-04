import { describe, expect, it } from 'vitest'

import { validateGameDragDropMathPublish } from './validateGameDragDropMathPublish'

describe('validateGameDragDropMathPublish', () => {
  it('passes for a tab with evaluatable committed equation row', () => {
    const issues = validateGameDragDropMathPublish({
      points: 10,
      exerciseTabs: [
        {
          id: 'tab-1',
          title: 'Exercise 1',
          canvasRows: [
            {
              id: 'row-1',
              variant: 'math',
              tokens: [
                {
                  id: 't-eq',
                  variant: 'math',
                  mathRole: 'equation',
                  value: '2+2',
                  expression: '2+2',
                },
                {
                  id: 't-eq-sign',
                  variant: 'math',
                  mathRole: 'equals',
                  value: '=',
                  disabled: true,
                },
                { id: 't-res', variant: 'math', mathRole: 'result', value: '4', disabled: true },
              ],
            },
          ],
        },
      ],
    })

    expect(issues.filter((issue) => issue.severity === 'error')).toHaveLength(0)
  })

  it('blocks when exercise tab canvas is empty', () => {
    const issues = validateGameDragDropMathPublish({
      points: 10,
      exerciseTabs: [{ id: 'tab-1', title: 'Exercise 1', canvasRows: [] }],
    })

    expect(issues.some((issue) => issue.code === 'dndMath.tab.emptyCanvas')).toBe(true)
  })
})
