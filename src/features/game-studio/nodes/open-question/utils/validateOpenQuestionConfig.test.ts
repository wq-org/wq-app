import { describe, expect, it } from 'vitest'

import { validateOpenQuestionConfig } from './validateOpenQuestionConfig'

describe('validateOpenQuestionConfig', () => {
  it('passes when exercises are gradable and points are valid without legacy title', () => {
    const issues = validateOpenQuestionConfig({
      points: 10,
      questions: [{ id: 'q1', question: 'What is 2+2?', answer: '4' }],
    })

    expect(issues.filter((issue) => issue.severity === 'error')).toHaveLength(0)
    expect(issues.some((issue) => issue.code === 'openQuestion.meta.missingTitle')).toBe(false)
  })

  it('blocks when prompt is missing', () => {
    const issues = validateOpenQuestionConfig({
      points: 10,
      questions: [{ id: 'q1', question: '', answer: '4' }],
    })

    expect(issues.some((issue) => issue.code === 'openQuestion.prompt.missing')).toBe(true)
  })

  it('blocks when answer is missing for a previewable exercise', () => {
    const issues = validateOpenQuestionConfig({
      points: 10,
      questions: [{ id: 'q1', question: 'Explain gravity', answer: '   ' }],
    })

    expect(issues.some((issue) => issue.code === 'openQuestion.answer.missing')).toBe(true)
  })
})
