import { describe, expect, it } from 'vitest'

import type { GameImagePinRect } from '../image-pin.schema'
import { isImagePinPreviewPlayable } from './imagePinPreviewPlayable'

function makeRect(
  overrides: Partial<GameImagePinRect> & Pick<GameImagePinRect, 'id'>,
): GameImagePinRect {
  return {
    x: 10,
    y: 10,
    width: 48,
    height: 48,
    question: '',
    ...overrides,
  }
}

describe('isImagePinPreviewPlayable', () => {
  it('returns false without image or questions', () => {
    expect(isImagePinPreviewPlayable({})).toBe(false)
    expect(
      isImagePinPreviewPlayable({
        imagePreview: 'https://example.com/a.png',
        rectangles: [makeRect({ id: 'r1', question: '  ' })],
      }),
    ).toBe(false)
  })

  it('returns true with image and a filled question', () => {
    expect(
      isImagePinPreviewPlayable({
        filepath: 'games/pin.png',
        rectangles: [makeRect({ id: 'r1', question: 'Where?' })],
      }),
    ).toBe(true)
  })
})
