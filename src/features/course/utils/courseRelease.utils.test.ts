import { describe, expect, it } from 'vitest'

import type { LessonDraftState } from '@/features/lesson/types/lesson.types'

import type { CourseDraftSnapshot } from '../types/course-release.types'
import type { PublishedCourseVersion } from '../types/course-version.types'
import {
  compareDraftToPublished,
  comparePublishedVersions,
  resolveLessonReleaseStatus,
} from './courseRelease.utils'

function buildDraft(overrides: Partial<CourseDraftSnapshot> = {}): CourseDraftSnapshot {
  return {
    course: {
      id: 'course-1',
      title: 'Draft title',
      description: 'Draft description',
      teacher_id: 'teacher-1',
      institution_id: 'inst-1',
      theme_id: 'blue',
      is_published: true,
      created_at: '2026-06-01T00:00:00.000Z',
      updated_at: '2026-06-01T00:00:00.000Z',
    },
    topics: [
      {
        id: 'topic-1',
        course_id: 'course-1',
        title: 'Topic A',
        description: 'Topic A description',
        order_index: 0,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Lesson 1',
            description: 'Lesson 1 description',
            content: {
              root: {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'Hello',
                        type: 'text',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'paragraph',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'root',
                version: 1,
              },
            } as unknown as LessonDraftState,
          },
        ],
      },
    ],
    ...overrides,
  }
}

function buildLive(overrides: Partial<PublishedCourseVersion> = {}): PublishedCourseVersion {
  return {
    id: 'version-1',
    courseId: 'course-1',
    versionNo: 3,
    status: 'published',
    publishedAt: new Date('2026-06-01T12:00:00.000Z'),
    hasPendingChanges: false,
    courseTitle: 'Draft title',
    courseDescription: 'Draft description',
    themeId: 'blue',
    topics: [
      {
        id: 'cvt-1',
        sourceTopicId: 'topic-1',
        title: 'Topic A',
        description: 'Topic A description',
        orderIndex: 0,
        lessons: [
          {
            id: 'cvl-1',
            sourceLessonId: 'lesson-1',
            title: 'Lesson 1',
            description: 'Lesson 1 description',
            content: {
              root: {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'Hello',
                        type: 'text',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'paragraph',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'root',
                version: 1,
              },
            } as unknown as LessonDraftState,
            pages: [],
            orderIndex: 0,
            contentSchemaVersion: 1,
          },
        ],
      },
    ],
    ...overrides,
  }
}

describe('compareDraftToPublished', () => {
  it('returns none when draft matches live snapshot', () => {
    const diff = compareDraftToPublished({ draft: buildDraft(), live: buildLive() })

    expect(diff.recommendedReleaseType).toBe('none')
    expect(diff.summary.totalChanges).toBe(0)
    expect(diff.statusLineKeys[0]?.key).toBe('settings.draftChanges.status.noChanges')
  })

  it('recommends patch for course metadata drift', () => {
    const diff = compareDraftToPublished({
      draft: buildDraft({
        course: { ...buildDraft().course, title: 'Updated title' },
      }),
      live: buildLive(),
    })

    expect(diff.recommendedReleaseType).toBe('patch')
    expect(diff.courseMetadata.titleChanged).toBe(true)
    expect(diff.files.some((file) => file.id === 'course-metadata')).toBe(true)
  })

  it('recommends patch for lesson content changes without block-type changes', () => {
    const draft = buildDraft()
    draft.topics[0]!.lessons[0]!.content = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Changed',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as unknown as LessonDraftState

    const diff = compareDraftToPublished({ draft, live: buildLive() })

    expect(diff.recommendedReleaseType).toBe('minor')
    expect(diff.summary.lessonsContentChanged).toBe(1)
    expect(diff.files.some((file) => file.id === 'lesson-content-lesson-1')).toBe(true)
  })

  it('recommends major when topics are reordered', () => {
    const live = buildLive({
      topics: [
        {
          id: 'cvt-1',
          sourceTopicId: 'topic-1',
          title: 'Topic A',
          description: 'Topic A description',
          orderIndex: 0,
          lessons: buildLive().topics[0]!.lessons,
        },
        {
          id: 'cvt-2',
          sourceTopicId: 'topic-2',
          title: 'Topic B',
          description: 'Topic B description',
          orderIndex: 1,
          lessons: [],
        },
      ],
    })

    const diff = compareDraftToPublished({
      draft: buildDraft({
        topics: [
          {
            id: 'topic-2',
            course_id: 'course-1',
            title: 'Topic B',
            description: 'Topic B description',
            order_index: 0,
            lessons: [],
          },
          {
            id: 'topic-1',
            course_id: 'course-1',
            title: 'Topic A',
            description: 'Topic A description',
            order_index: 1,
            lessons: buildDraft().topics[0]!.lessons,
          },
        ],
      }),
      live,
    })

    expect(diff.recommendedReleaseType).toBe('major')
    expect(diff.summary.topicsReordered).toBe(1)
  })

  it('recommends major when a lesson is added', () => {
    const diff = compareDraftToPublished({
      draft: buildDraft({
        topics: [
          {
            ...buildDraft().topics[0]!,
            lessons: [
              ...buildDraft().topics[0]!.lessons,
              {
                id: 'lesson-2',
                title: 'Lesson 2',
                description: 'New lesson',
                content: {
                  root: {
                    children: [],
                    direction: null,
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1,
                  },
                } as unknown as LessonDraftState,
              },
            ],
          },
        ],
      }),
      live: buildLive(),
    })

    expect(diff.recommendedReleaseType).toBe('major')
    expect(diff.summary.lessonsAdded).toBe(1)
  })

  it('recommends major for first publish when draft has topics and no live version', () => {
    const diff = compareDraftToPublished({ draft: buildDraft(), live: null })

    expect(diff.recommendedReleaseType).toBe('major')
    expect(diff.summary.topicsAdded).toBeGreaterThan(0)
  })
})

describe('comparePublishedVersions', () => {
  it('returns major with first publish summary when no previous version', () => {
    const result = comparePublishedVersions(buildLive(), null)

    expect(result.releaseType).toBe('major')
    expect(result.changeSummaryKeys[0]?.key).toBe('history.changeSummary.firstPublish')
  })

  it('returns patch when only course metadata changed between versions', () => {
    const previous = buildLive({ versionNo: 1 })
    const current = buildLive({
      id: 'version-2',
      versionNo: 2,
      courseTitle: 'Updated title',
    })

    const result = comparePublishedVersions(current, previous)

    expect(result.releaseType).toBe('patch')
    expect(result.changeSummaryKeys.some((line) => line.key.includes('metadataChanged'))).toBe(true)
  })

  it('returns major when a lesson is added between versions', () => {
    const previous = buildLive({ versionNo: 1 })
    const current = buildLive({
      id: 'version-2',
      versionNo: 2,
      topics: [
        {
          ...buildLive().topics[0]!,
          lessons: [
            ...buildLive().topics[0]!.lessons,
            {
              id: 'cvl-2',
              sourceLessonId: 'lesson-2',
              title: 'Lesson 2',
              description: 'New lesson',
              content: {
                root: {
                  children: [],
                  direction: null,
                  format: '',
                  indent: 0,
                  type: 'root',
                  version: 1,
                },
              } as unknown as LessonDraftState,
              pages: [],
              orderIndex: 1,
              contentSchemaVersion: 1,
            },
          ],
        },
      ],
    })

    const result = comparePublishedVersions(current, previous)

    expect(result.releaseType).toBe('major')
    expect(result.changeSummaryKeys.some((line) => line.key.includes('lessonsAdded'))).toBe(true)
  })
})

describe('resolveLessonReleaseStatus', () => {
  it('marks lesson as in live with no drift when unchanged', () => {
    const diff = compareDraftToPublished({ draft: buildDraft(), live: buildLive() })
    const status = resolveLessonReleaseStatus(diff, buildLive(), 'lesson-1')

    expect(status.isInLiveSnapshot).toBe(true)
    expect(status.liveVersionNo).toBe(3)
    expect(status.hasDraftDrift).toBe(false)
  })

  it('marks lesson with drift when content changed', () => {
    const draft = buildDraft()
    draft.topics[0]!.lessons[0]!.content = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Changed',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as unknown as LessonDraftState
    const live = buildLive()
    const diff = compareDraftToPublished({ draft, live })
    const status = resolveLessonReleaseStatus(diff, live, 'lesson-1')

    expect(status.hasDraftDrift).toBe(true)
    expect(status.diffFileId).toBe('lesson-content-lesson-1')
  })
})
