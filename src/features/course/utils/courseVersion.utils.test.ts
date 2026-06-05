import { describe, expect, it } from 'vitest'

import { toPublishedCourseVersion } from './courseVersion.utils'
import type { CourseVersionTreeRow } from '../types/course-version.types'
import type { LessonDraftState } from '@/features/lesson/types/lesson.types'

function buildTreeRow(overrides: Partial<CourseVersionTreeRow> = {}): CourseVersionTreeRow {
  return {
    id: 'version-1',
    institution_id: 'inst-1',
    course_id: 'course-1',
    version_no: 3,
    status: 'published',
    published_at: '2026-06-01T12:00:00.000Z',
    has_pending_changes: false,
    title: 'Live snapshot title',
    description: 'Live snapshot description',
    theme_id: 'teal',
    created_at: '2026-06-01T12:00:00.000Z',
    updated_at: '2026-06-01T12:00:00.000Z',
    course_version_topics: [],
    courses: {
      id: 'course-1',
      title: 'Draft title',
      description: 'Draft description',
      theme_id: 'orange',
    },
    ...overrides,
  }
}

describe('toPublishedCourseVersion', () => {
  it('prefers snapshot metadata on course_versions over mutable courses row', () => {
    const result = toPublishedCourseVersion(buildTreeRow())

    expect(result.courseTitle).toBe('Live snapshot title')
    expect(result.courseDescription).toBe('Live snapshot description')
    expect(result.themeId).toBe('teal')
  })

  it('falls back to legacy courses join when snapshot metadata is missing', () => {
    const result = toPublishedCourseVersion(
      buildTreeRow({
        title: null,
        description: null,
        theme_id: null,
      }),
    )

    expect(result.courseTitle).toBe('Draft title')
    expect(result.courseDescription).toBe('Draft description')
    expect(result.themeId).toBe('orange')
  })

  it('maps topic and lesson data from course_version snapshot rows only', () => {
    const result = toPublishedCourseVersion(
      buildTreeRow({
        course_version_topics: [
          {
            id: 'cvt-1',
            course_version_id: 'version-1',
            source_topic_id: 'topic-1',
            title: 'Snapshot topic',
            description: 'Snapshot topic description',
            order_index: 0,
            course_version_lessons: [
              {
                id: 'cvl-1',
                course_version_topic_id: 'cvt-1',
                source_lesson_id: 'lesson-1',
                title: 'Snapshot lesson',
                description: 'Snapshot lesson description',
                content: {} as LessonDraftState,
                pages: [],
                order_index: 0,
                content_schema_version: 1,
              },
            ],
          },
        ],
      }),
    )

    expect(result.topics).toHaveLength(1)
    expect(result.topics[0]?.title).toBe('Snapshot topic')
    expect(result.topics[0]?.lessons[0]?.title).toBe('Snapshot lesson')
  })
})
