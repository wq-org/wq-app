import { describe, expect, it } from 'vitest'

import { isGameStudioPreviewPath } from './isGameStudioPreviewPath'

describe('isGameStudioPreviewPath', () => {
  it('matches teacher canvas preview route', () => {
    expect(isGameStudioPreviewPath('/teacher/canvas/abc-123/preview')).toBe(true)
  })

  it('does not match canvas editor', () => {
    expect(isGameStudioPreviewPath('/teacher/canvas/abc-123')).toBe(false)
  })
})
