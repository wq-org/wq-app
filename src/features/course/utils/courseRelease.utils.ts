import { lessonDraftStateToJson, normalizeLessonDraftState } from '@/features/lesson'

import type {
  CourseDraftDiff,
  CourseDraftDiffFile,
  CourseDraftDiffSummary,
  CourseReleaseCompareInput,
  CourseReleaseStatusLineKey,
  LessonReleaseStatus,
  ReleaseType,
} from '../types/course-release.types'
import type {
  PublishedCourseLesson,
  PublishedCourseTopic,
  PublishedCourseVersion,
} from '../types/course-version.types'

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim()
}

function formatJsonForDiff(value: unknown): string {
  return JSON.stringify(normalizeLessonDraftState(value), null, 2)
}

function collectLexicalBlockTypes(value: unknown): Set<string> {
  const types = new Set<string>()

  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const record = node as Record<string, unknown>
    if (typeof record.type === 'string') {
      types.add(record.type)
    }
    if (Array.isArray(record.children)) {
      record.children.forEach(walk)
    }
    if ('root' in record) {
      walk(record.root)
    }
  }

  walk(value)
  return types
}

function hasBlockTypeSetChange(draftContent: unknown, liveContent: unknown): boolean {
  const draftTypes = [...collectLexicalBlockTypes(draftContent)].sort().join(',')
  const liveTypes = [...collectLexicalBlockTypes(liveContent)].sort().join(',')
  return draftTypes !== liveTypes
}

function hasContentChanged(draftContent: unknown, liveContent: unknown): boolean {
  return lessonDraftStateToJson(draftContent) !== lessonDraftStateToJson(liveContent)
}

function serializeCourseMetadata(input: {
  title: string
  description: string
  themeId: string
}): string {
  return [
    `Title: ${input.title}`,
    `Description: ${input.description}`,
    `Theme: ${input.themeId}`,
  ].join('\n')
}

function serializeTopicMetadata(input: {
  title: string
  description: string
  orderIndex: number
}): string {
  return [
    `Title: ${input.title}`,
    `Description: ${input.description}`,
    `Order: ${input.orderIndex + 1}`,
  ].join('\n')
}

function serializeLessonMetadata(input: {
  title: string
  description: string
  orderIndex: number
}): string {
  return [
    `Title: ${input.title}`,
    `Description: ${input.description}`,
    `Order: ${input.orderIndex + 1}`,
  ].join('\n')
}

function serializeTopicOrder(topics: Array<{ title: string; orderIndex: number }>): string {
  if (topics.length === 0) return '(empty)'
  return topics.map((topic, index) => `${index + 1}. ${topic.title}`).join('\n')
}

function emptySummary(): CourseDraftDiffSummary {
  return {
    totalChanges: 0,
    topicsAdded: 0,
    topicsRemoved: 0,
    topicsReordered: 0,
    topicsModified: 0,
    lessonsAdded: 0,
    lessonsRemoved: 0,
    lessonsReordered: 0,
    lessonsModified: 0,
    lessonsContentChanged: 0,
    metadataChanged: false,
  }
}

function buildStatusLineKeys(summary: CourseDraftDiffSummary): CourseReleaseStatusLineKey[] {
  const lines: CourseReleaseStatusLineKey[] = []

  if (summary.totalChanges === 0) {
    lines.push({ key: 'settings.draftChanges.status.noChanges' })
    return lines
  }

  lines.push({
    key: 'settings.draftChanges.status.totalChanges',
    count: summary.totalChanges,
  })

  if (summary.metadataChanged) {
    lines.push({ key: 'settings.draftChanges.status.metadataChanged' })
  }

  if (summary.topicsAdded > 0) {
    lines.push({ key: 'settings.draftChanges.status.topicsAdded', count: summary.topicsAdded })
  }
  if (summary.topicsRemoved > 0) {
    lines.push({ key: 'settings.draftChanges.status.topicsRemoved', count: summary.topicsRemoved })
  }
  if (summary.topicsReordered > 0) {
    lines.push({ key: 'settings.draftChanges.status.topicsReordered' })
  }
  if (summary.topicsModified > 0) {
    lines.push({
      key: 'settings.draftChanges.status.topicsModified',
      count: summary.topicsModified,
    })
  }
  if (summary.lessonsAdded > 0) {
    lines.push({ key: 'settings.draftChanges.status.lessonsAdded', count: summary.lessonsAdded })
  }
  if (summary.lessonsRemoved > 0) {
    lines.push({
      key: 'settings.draftChanges.status.lessonsRemoved',
      count: summary.lessonsRemoved,
    })
  }
  if (summary.lessonsReordered > 0) {
    lines.push({ key: 'settings.draftChanges.status.lessonsReordered' })
  }
  if (summary.lessonsModified > 0) {
    lines.push({
      key: 'settings.draftChanges.status.lessonsModified',
      count: summary.lessonsModified,
    })
  }
  if (summary.lessonsContentChanged > 0) {
    lines.push({
      key: 'settings.draftChanges.status.lessonsContentChanged',
      count: summary.lessonsContentChanged,
    })
  }

  return lines
}

function classifyReleaseType(
  summary: CourseDraftDiffSummary,
  hasStructuralMajor: boolean,
): ReleaseType {
  if (summary.totalChanges === 0) return 'none'

  if (
    hasStructuralMajor ||
    summary.topicsAdded > 0 ||
    summary.topicsRemoved > 0 ||
    summary.topicsReordered > 0 ||
    summary.lessonsAdded > 0 ||
    summary.lessonsRemoved > 0 ||
    summary.lessonsReordered > 0
  ) {
    return 'major'
  }

  return 'patch'
}

function findLiveTopicBySourceId(
  live: PublishedCourseVersion,
  sourceTopicId: string,
): PublishedCourseTopic | undefined {
  return live.topics.find((topic) => topic.sourceTopicId === sourceTopicId)
}

function findLiveLessonBySourceId(
  liveTopic: PublishedCourseTopic,
  sourceLessonId: string,
): PublishedCourseLesson | undefined {
  return liveTopic.lessons.find((lesson) => lesson.sourceLessonId === sourceLessonId)
}

export function compareDraftToPublished({
  draft,
  live,
}: CourseReleaseCompareInput): CourseDraftDiff {
  const summary = emptySummary()
  const files: CourseDraftDiffFile[] = []
  let hasStructuralMajor = false

  const draftTopics = [...draft.topics].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))

  if (!live) {
    if (draftTopics.length > 0) {
      summary.topicsAdded = draftTopics.length
      summary.totalChanges += draftTopics.length

      draftTopics.forEach((topic, topicIndex) => {
        files.push({
          id: `topic-added-${topic.id}`,
          label: topic.title,
          kind: 'topic',
          changeKind: 'added',
          oldFile: { name: 'live/topic.md', content: '(not in live version)' },
          newFile: {
            name: 'draft/topic.md',
            content: serializeTopicMetadata({
              title: topic.title,
              description: topic.description,
              orderIndex: topicIndex,
            }),
          },
        })

        topic.lessons.forEach((lesson) => {
          summary.lessonsAdded += 1
          summary.totalChanges += 1
          files.push({
            id: `lesson-added-${lesson.id}`,
            label: lesson.title,
            kind: 'lesson',
            changeKind: 'added',
            oldFile: { name: 'live/lesson.json', content: '(not in live version)' },
            newFile: {
              name: 'draft/lesson.json',
              content: formatJsonForDiff(lesson.content),
            },
          })
        })
      })
    }

    const metadataChanged =
      normalizeText(draft.course.title).length > 0 ||
      normalizeText(draft.course.description).length > 0

    return {
      summary: {
        ...summary,
        metadataChanged,
        totalChanges: summary.totalChanges + (metadataChanged ? 1 : 0),
      },
      courseMetadata: {
        titleChanged: Boolean(normalizeText(draft.course.title)),
        descriptionChanged: Boolean(normalizeText(draft.course.description)),
        themeChanged: Boolean(draft.course.theme_id),
      },
      files,
      recommendedReleaseType: summary.totalChanges > 0 ? 'major' : 'none',
      statusLineKeys: buildStatusLineKeys({
        ...summary,
        totalChanges: summary.totalChanges + (metadataChanged ? 1 : 0),
      }),
    }
  }

  const titleChanged = normalizeText(draft.course.title) !== normalizeText(live.courseTitle)
  const descriptionChanged =
    normalizeText(draft.course.description) !== normalizeText(live.courseDescription)
  const themeChanged = draft.course.theme_id !== live.themeId

  if (titleChanged || descriptionChanged || themeChanged) {
    summary.metadataChanged = true
    summary.totalChanges += 1
    files.push({
      id: 'course-metadata',
      label: 'Course metadata',
      kind: 'course',
      changeKind: 'modified',
      oldFile: {
        name: 'live/course-metadata.md',
        content: serializeCourseMetadata({
          title: live.courseTitle,
          description: live.courseDescription,
          themeId: live.themeId,
        }),
      },
      newFile: {
        name: 'draft/course-metadata.md',
        content: serializeCourseMetadata({
          title: draft.course.title,
          description: draft.course.description,
          themeId: draft.course.theme_id,
        }),
      },
    })
  }

  const liveTopicsBySource = live.topics
    .filter((topic) => topic.sourceTopicId)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const draftTopicIds = draftTopics.map((topic) => topic.id)
  const liveTopicSourceIds = liveTopicsBySource
    .map((topic) => topic.sourceTopicId)
    .filter((id): id is string => Boolean(id))

  const draftTopicOrderChanged =
    draftTopicIds.length === liveTopicSourceIds.length &&
    draftTopicIds.some((id, index) => id !== liveTopicSourceIds[index])

  if (draftTopicOrderChanged) {
    summary.topicsReordered = 1
    summary.totalChanges += 1
    hasStructuralMajor = true
    files.push({
      id: 'topic-order',
      label: 'Topic order',
      kind: 'topic',
      changeKind: 'reordered',
      oldFile: {
        name: 'live/topic-order.md',
        content: serializeTopicOrder(
          liveTopicsBySource.map((topic) => ({ title: topic.title, orderIndex: topic.orderIndex })),
        ),
      },
      newFile: {
        name: 'draft/topic-order.md',
        content: serializeTopicOrder(
          draftTopics.map((topic, index) => ({ title: topic.title, orderIndex: index })),
        ),
      },
    })
  }

  for (const draftTopic of draftTopics) {
    const liveTopic = findLiveTopicBySourceId(live, draftTopic.id)

    if (!liveTopic) {
      summary.topicsAdded += 1
      summary.totalChanges += 1
      hasStructuralMajor = true
      files.push({
        id: `topic-added-${draftTopic.id}`,
        label: draftTopic.title,
        kind: 'topic',
        changeKind: 'added',
        oldFile: { name: 'live/topic.md', content: '(removed from live snapshot)' },
        newFile: {
          name: 'draft/topic.md',
          content: serializeTopicMetadata({
            title: draftTopic.title,
            description: draftTopic.description,
            orderIndex: draftTopic.order_index ?? 0,
          }),
        },
      })
      continue
    }

    const topicTitleChanged = normalizeText(draftTopic.title) !== normalizeText(liveTopic.title)
    const topicDescriptionChanged =
      normalizeText(draftTopic.description) !== normalizeText(liveTopic.description)

    if (topicTitleChanged || topicDescriptionChanged) {
      summary.topicsModified += 1
      summary.totalChanges += 1
      files.push({
        id: `topic-modified-${draftTopic.id}`,
        label: draftTopic.title,
        kind: 'topic',
        changeKind: 'modified',
        oldFile: {
          name: 'live/topic.md',
          content: serializeTopicMetadata({
            title: liveTopic.title,
            description: liveTopic.description,
            orderIndex: liveTopic.orderIndex,
          }),
        },
        newFile: {
          name: 'draft/topic.md',
          content: serializeTopicMetadata({
            title: draftTopic.title,
            description: draftTopic.description,
            orderIndex: draftTopic.order_index ?? 0,
          }),
        },
      })
    }

    const draftLessons = [...draftTopic.lessons]
    const liveLessons = [...liveTopic.lessons].sort((a, b) => a.orderIndex - b.orderIndex)
    const draftLessonIds = draftLessons.map((lesson) => lesson.id)
    const liveLessonSourceIds = liveLessons
      .map((lesson) => lesson.sourceLessonId)
      .filter((id): id is string => Boolean(id))

    const lessonOrderChanged =
      draftLessonIds.length === liveLessonSourceIds.length &&
      draftLessonIds.some((id, index) => id !== liveLessonSourceIds[index])

    if (lessonOrderChanged) {
      summary.lessonsReordered += 1
      summary.totalChanges += 1
      hasStructuralMajor = true
      files.push({
        id: `lesson-order-${draftTopic.id}`,
        label: `${draftTopic.title} lesson order`,
        kind: 'lesson',
        changeKind: 'reordered',
        oldFile: {
          name: 'live/lesson-order.md',
          content: liveLessons.map((lesson, index) => `${index + 1}. ${lesson.title}`).join('\n'),
        },
        newFile: {
          name: 'draft/lesson-order.md',
          content: draftLessons.map((lesson, index) => `${index + 1}. ${lesson.title}`).join('\n'),
        },
      })
    }

    for (const draftLesson of draftLessons) {
      const liveLesson = findLiveLessonBySourceId(liveTopic, draftLesson.id)

      if (!liveLesson) {
        summary.lessonsAdded += 1
        summary.totalChanges += 1
        hasStructuralMajor = true
        files.push({
          id: `lesson-added-${draftLesson.id}`,
          label: draftLesson.title,
          kind: 'lesson',
          changeKind: 'added',
          oldFile: { name: 'live/lesson.json', content: '(not in live version)' },
          newFile: {
            name: 'draft/lesson.json',
            content: formatJsonForDiff(draftLesson.content),
          },
        })
        continue
      }

      const lessonTitleChanged =
        normalizeText(draftLesson.title) !== normalizeText(liveLesson.title)
      const lessonDescriptionChanged =
        normalizeText(draftLesson.description) !== normalizeText(liveLesson.description)
      const contentChanged = hasContentChanged(draftLesson.content, liveLesson.content)
      const blockTypeChanged = hasBlockTypeSetChange(draftLesson.content, liveLesson.content)

      if (blockTypeChanged) {
        hasStructuralMajor = true
      }

      if (lessonTitleChanged || lessonDescriptionChanged) {
        summary.lessonsModified += 1
        summary.totalChanges += 1
        files.push({
          id: `lesson-metadata-${draftLesson.id}`,
          label: draftLesson.title,
          kind: 'lesson',
          changeKind: 'modified',
          oldFile: {
            name: 'live/lesson.md',
            content: serializeLessonMetadata({
              title: liveLesson.title,
              description: liveLesson.description,
              orderIndex: liveLesson.orderIndex,
            }),
          },
          newFile: {
            name: 'draft/lesson.md',
            content: serializeLessonMetadata({
              title: draftLesson.title,
              description: draftLesson.description,
              orderIndex: draftLessons.indexOf(draftLesson),
            }),
          },
        })
      }

      if (contentChanged) {
        summary.lessonsContentChanged += 1
        summary.totalChanges += 1
        files.push({
          id: `lesson-content-${draftLesson.id}`,
          label: `${draftLesson.title} content`,
          kind: 'lesson',
          changeKind: 'modified',
          oldFile: {
            name: 'live/lesson.json',
            content: formatJsonForDiff(liveLesson.content),
          },
          newFile: {
            name: 'draft/lesson.json',
            content: formatJsonForDiff(draftLesson.content),
          },
        })
      }
    }

    for (const liveLesson of liveLessons) {
      if (!liveLesson.sourceLessonId) continue
      const stillExists = draftLessons.some((lesson) => lesson.id === liveLesson.sourceLessonId)
      if (!stillExists) {
        summary.lessonsRemoved += 1
        summary.totalChanges += 1
        hasStructuralMajor = true
        files.push({
          id: `lesson-removed-${liveLesson.sourceLessonId}`,
          label: liveLesson.title,
          kind: 'lesson',
          changeKind: 'removed',
          oldFile: {
            name: 'live/lesson.json',
            content: formatJsonForDiff(liveLesson.content),
          },
          newFile: { name: 'draft/lesson.json', content: '(removed from draft)' },
        })
      }
    }
  }

  for (const liveTopic of liveTopicsBySource) {
    if (!liveTopic.sourceTopicId) continue
    const stillExists = draftTopics.some((topic) => topic.id === liveTopic.sourceTopicId)
    if (!stillExists) {
      summary.topicsRemoved += 1
      summary.totalChanges += 1
      hasStructuralMajor = true
      files.push({
        id: `topic-removed-${liveTopic.sourceTopicId}`,
        label: liveTopic.title,
        kind: 'topic',
        changeKind: 'removed',
        oldFile: {
          name: 'live/topic.md',
          content: serializeTopicMetadata({
            title: liveTopic.title,
            description: liveTopic.description,
            orderIndex: liveTopic.orderIndex,
          }),
        },
        newFile: { name: 'draft/topic.md', content: '(removed from draft)' },
      })
    }
  }

  const recommendedReleaseType = classifyReleaseType(summary, hasStructuralMajor)

  return {
    summary,
    courseMetadata: {
      titleChanged,
      descriptionChanged,
      themeChanged,
    },
    files,
    recommendedReleaseType,
    statusLineKeys: buildStatusLineKeys(summary),
  }
}

export function buildCourseReleaseReviewRoute(courseId: string, focusLessonId?: string): string {
  const base = `/teacher/course/${courseId}/release/review`
  if (focusLessonId?.trim()) {
    return `${base}?focus=${encodeURIComponent(focusLessonId.trim())}`
  }
  return base
}

export function findDiffFileByLessonId(
  diff: CourseDraftDiff,
  lessonId: string,
): CourseDraftDiffFile | undefined {
  return (
    diff.files.find((file) => file.id === `lesson-content-${lessonId}`) ??
    diff.files.find((file) => file.id === `lesson-metadata-${lessonId}`) ??
    diff.files.find((file) => file.id === `lesson-added-${lessonId}`)
  )
}

export function resolveLessonReleaseStatus(
  diff: CourseDraftDiff,
  live: PublishedCourseVersion | null,
  lessonId: string,
): LessonReleaseStatus {
  if (!live) {
    return {
      isInLiveSnapshot: false,
      liveVersionNo: null,
      hasDraftDrift: false,
      diffFileId: null,
    }
  }

  const isInLiveSnapshot = live.topics.some((topic) =>
    topic.lessons.some((lesson) => lesson.sourceLessonId === lessonId),
  )

  if (!isInLiveSnapshot) {
    const addedFile = diff.files.find((file) => file.id === `lesson-added-${lessonId}`)
    return {
      isInLiveSnapshot: false,
      liveVersionNo: live.versionNo,
      hasDraftDrift: Boolean(addedFile),
      diffFileId: addedFile?.id ?? null,
    }
  }

  const diffFile = findDiffFileByLessonId(diff, lessonId)
  return {
    isInLiveSnapshot: true,
    liveVersionNo: live.versionNo,
    hasDraftDrift: Boolean(diffFile),
    diffFileId: diffFile?.id ?? null,
  }
}
