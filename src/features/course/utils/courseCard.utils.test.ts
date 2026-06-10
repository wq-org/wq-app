import { describe, expect, it } from 'vitest'

import { resolveCourseCardReleaseStatus } from './courseCard.utils'

describe('resolveCourseCardReleaseStatus', () => {
  it('returns live when students can see at least one delivery', () => {
    expect(
      resolveCourseCardReleaseStatus({
        studentVisibleDeliveryCount: 2,
        offlineDeliveryCount: 1,
      }),
    ).toBe('live')
  })

  it('returns offline when deliveries exist but none are student-visible', () => {
    expect(
      resolveCourseCardReleaseStatus({
        studentVisibleDeliveryCount: 0,
        offlineDeliveryCount: 1,
      }),
    ).toBe('offline')
  })

  it('returns draft when there are no current deliveries', () => {
    expect(
      resolveCourseCardReleaseStatus({
        studentVisibleDeliveryCount: 0,
        offlineDeliveryCount: 0,
      }),
    ).toBe('draft')
  })
})
