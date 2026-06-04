import { describe, expect, it } from 'vitest'

import { validateGameImagePinPublish } from './validateGameImagePinPublish'

describe('validateGameImagePinPublish', () => {
  it('returns no errors for a complete image pin node', () => {
    const issues = validateGameImagePinPublish({
      title: 'Pin task',
      description: 'Place pins on regions',
      imagePreview: 'https://example.com/image.png',
      points: 10,
      rectangles: [
        {
          id: 'r1',
          x: 10,
          y: 10,
          width: 48,
          height: 48,
          question: 'Where is the heart?',
        },
      ],
    })

    expect(issues.filter((issue) => issue.severity === 'error')).toHaveLength(0)
  })

  it('blocks when image and rectangles are missing', () => {
    const issues = validateGameImagePinPublish({ title: 'T', description: 'D' })
    const codes = issues.map((issue) => issue.code)

    expect(codes).toContain('imagePin.image.missing')
    expect(codes).toContain('imagePin.rect.none')
    expect(codes).not.toContain('imagePin.meta.incomplete')
  })

  it('does not warn about meta when only the game description is filled', () => {
    const issues = validateGameImagePinPublish({
      description: 'Learners see this when the game starts',
      imagePreview: 'https://example.com/image.png',
      rectangles: [
        {
          id: 'r1',
          x: 10,
          y: 10,
          width: 48,
          height: 48,
          question: 'Where is the heart?',
        },
      ],
    })

    expect(issues.some((issue) => issue.code === 'imagePin.meta.incomplete')).toBe(false)
  })

  it('warns when the game description is missing', () => {
    const issues = validateGameImagePinPublish({
      title: 'Pin task',
      imagePreview: 'https://example.com/image.png',
      rectangles: [
        {
          id: 'r1',
          x: 10,
          y: 10,
          width: 48,
          height: 48,
          question: 'Where is the heart?',
        },
      ],
    })

    expect(issues.some((issue) => issue.code === 'imagePin.meta.incomplete')).toBe(true)
  })

  it('requires question text on each rectangle', () => {
    const issues = validateGameImagePinPublish({
      title: 'Pin',
      description: 'Desc',
      imagePreview: 'data:image/png;base64,abc',
      rectangles: [{ id: 'r1', x: 0, y: 0, width: 30, height: 30, question: '' }],
    })

    expect(issues.some((issue) => issue.code === 'imagePin.rect.missingQuestion')).toBe(true)
  })
})
