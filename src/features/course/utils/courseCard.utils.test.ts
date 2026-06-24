import { describe, expect, it } from 'vitest'

import { isCourseDeliveryOffline, resolveCourseCardReleaseStatus } from './courseCard.utils'

describe('isCourseDeliveryOffline', () => {
  it('returns true when deliveries exist but none are student-visible', () => {
    expect(
      isCourseDeliveryOffline({
        studentVisibleDeliveryCount: 0,
        offlineDeliveryCount: 2,
      }),
    ).toBe(true)
  })

  it('returns false when at least one delivery is student-visible', () => {
    expect(
      isCourseDeliveryOffline({
        studentVisibleDeliveryCount: 1,
        offlineDeliveryCount: 1,
      }),
    ).toBe(false)
  })

  it('returns false when there are no offline deliveries', () => {
    expect(
      isCourseDeliveryOffline({
        studentVisibleDeliveryCount: 0,
        offlineDeliveryCount: 0,
      }),
    ).toBe(false)
  })
})

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
