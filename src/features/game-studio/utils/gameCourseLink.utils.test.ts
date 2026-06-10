import { describe, expect, it } from 'vitest'

import { resolveGameLinkedCourseIds } from './gameCourseLink.utils'

describe('resolveGameLinkedCourseIds', () => {
  it('returns junction-table course ids', () => {
    expect(
      resolveGameLinkedCourseIds({
        course_id: null,
        game_course_links: [{ course_id: 'course-a' }, { course_id: 'course-b' }],
      }),
    ).toEqual(['course-a', 'course-b'])
  })

  it('includes legacy games.course_id when junction rows are missing', () => {
    expect(
      resolveGameLinkedCourseIds({
        course_id: 'legacy-course',
        game_course_links: [],
      }),
    ).toEqual(['legacy-course'])
  })

  it('dedupes when course_id matches a junction row', () => {
    expect(
      resolveGameLinkedCourseIds({
        course_id: 'course-a',
        game_course_links: [{ course_id: 'course-a' }],
      }),
    ).toEqual(['course-a'])
  })
})
