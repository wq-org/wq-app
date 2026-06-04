import { describe, expect, it } from 'vitest'

import { isImagePinPreviewPlayable } from './imagePinPreviewPlayable'

describe('isImagePinPreviewPlayable', () => {
  it('returns false without image or questions', () => {
    expect(isImagePinPreviewPlayable({})).toBe(false)
    expect(
      isImagePinPreviewPlayable({
        imagePreview: 'https://example.com/a.png',
        rectangles: [{ id: 'r1', question: '  ' }],
      }),
    ).toBe(false)
  })

  it('returns true with image and a filled question', () => {
    expect(
      isImagePinPreviewPlayable({
        filepath: 'games/pin.png',
        rectangles: [{ id: 'r1', question: 'Where?' }],
      }),
    ).toBe(true)
  })
})
