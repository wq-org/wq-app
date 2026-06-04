import { describe, expect, it } from 'vitest'

import { validateGameIfElseConfig } from './game-if-else.schema'

describe('validateGameIfElseConfig', () => {
  it('does not require condition text', () => {
    const issues = validateGameIfElseConfig({ label: 'If / else', scoreThreshold: 50 })
    expect(issues.some((issue) => issue.code === 'ifElse.condition.missing')).toBe(false)
  })

  it('errors when score threshold is not a valid number', () => {
    expect(validateGameIfElseConfig({ scoreThreshold: undefined })).toEqual([
      { code: 'ifElse.scoreThreshold.missing', severity: 'error' },
    ])
    expect(validateGameIfElseConfig({ scoreThreshold: Number.NaN })).toEqual([
      { code: 'ifElse.scoreThreshold.missing', severity: 'error' },
    ])
  })

  it('allows zero and positive finite thresholds', () => {
    expect(validateGameIfElseConfig({ scoreThreshold: 0 })).toEqual([])
    expect(validateGameIfElseConfig({ scoreThreshold: 42 })).toEqual([])
  })
})
