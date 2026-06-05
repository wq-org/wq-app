import type { ThemeId } from '@/lib/themes'
import type { Lesson } from '@/features/lesson/types/lesson.types'
import type { TopicCardProps } from '@/features/topic/types/topic.types'

import type {
  CourseVersionLessonRow,
  CourseVersionTopicRow,
  CourseVersionTreeRow,
  PublishedCourseLesson,
  PublishedCourseTopic,
  PublishedCourseVersion,
  PublishedCourseVersionSummary,
} from '../types/course-version.types'

function sortByOrderIndex<T extends { order_index: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

function normalizeEmbeddedCourse(courses: CourseVersionTreeRow['courses']) {
  if (courses == null) return null
  return Array.isArray(courses) ? (courses[0] ?? null) : courses
}

export function toPublishedCourseLesson(row: CourseVersionLessonRow): PublishedCourseLesson {
  return {
    id: row.id,
    sourceLessonId: row.source_lesson_id,
    title: row.title,
    description: row.description?.trim() || '',
    content: row.content ?? null,
    pages: row.pages,
    orderIndex: row.order_index,
    contentSchemaVersion: row.content_schema_version,
  }
}

export function toPublishedCourseTopic(row: CourseVersionTopicRow): PublishedCourseTopic {
  const lessons = sortByOrderIndex(row.course_version_lessons ?? []).map(toPublishedCourseLesson)

  return {
    id: row.id,
    sourceTopicId: row.source_topic_id,
    title: row.title,
    description: row.description?.trim() || '',
    orderIndex: row.order_index,
    lessons,
  }
}

export function toPublishedCourseVersion(row: CourseVersionTreeRow): PublishedCourseVersion {
  const course = normalizeEmbeddedCourse(row.courses)
  const topics = sortByOrderIndex(row.course_version_topics ?? []).map(toPublishedCourseTopic)

  return {
    id: row.id,
    courseId: row.course_id,
    versionNo: row.version_no,
    status: row.status,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    hasPendingChanges: Boolean(row.has_pending_changes),
    courseTitle: course?.title?.trim() || '',
    courseDescription: course?.description?.trim() || '',
    themeId: (course?.theme_id ?? 'blue') as ThemeId,
    topics,
  }
}

export function toPublishedCourseVersionSummary(row: {
  id: string
  version_no: number
  published_at: string | null
  status: PublishedCourseVersionSummary['status']
}): PublishedCourseVersionSummary {
  return {
    id: row.id,
    versionNo: row.version_no,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    status: row.status,
  }
}

export function formatPublishedAt(date: Date | null, locale: string): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function buildPublishedLessonRoute(
  courseId: string,
  courseVersionId: string,
  sourceLessonId: string,
): string {
  return `/teacher/course/${courseId}/published/${courseVersionId}/lesson/${sourceLessonId}`
}

export function buildClassroomPublishedCourseRoute(classroomId: string, courseId: string): string {
  return `/teacher/dashboard/classroom/${classroomId}/course/${courseId}/published`
}

export function buildClassroomPublishedTopicRoute(
  classroomId: string,
  courseId: string,
  topicId: string,
): string {
  return `/teacher/dashboard/classroom/${classroomId}/course/${courseId}/published/topic/${topicId}`
}

export function buildClassroomPublishedLessonRoute(
  classroomId: string,
  courseId: string,
  topicId: string,
  lessonId: string,
): string {
  return `/teacher/dashboard/classroom/${classroomId}/course/${courseId}/published/topic/${topicId}/lesson/${lessonId}`
}

export function buildClassroomPublishedGameRoute(
  classroomId: string,
  courseId: string,
  gameId: string,
): string {
  return `/teacher/dashboard/classroom/${classroomId}/course/${courseId}/published/game/${gameId}`
}

export function buildPublishedTopicRoute(
  courseId: string,
  courseVersionId: string,
  topicId: string,
): string {
  return `/teacher/course/${courseId}/published/${courseVersionId}/topic/${topicId}`
}

export function buildPublishedTopicLessonRoute(
  courseId: string,
  courseVersionId: string,
  topicId: string,
  lessonId: string,
): string {
  return `/teacher/course/${courseId}/published/${courseVersionId}/topic/${topicId}/lesson/${lessonId}`
}

export function buildPublishedCourseGameRoute(
  courseId: string,
  courseVersionId: string,
  gameId: string,
): string {
  return `/teacher/course/${courseId}/published/${courseVersionId}/game/${gameId}`
}

export function buildPublishedCourseRoute(courseId: string, courseVersionId?: string): string {
  if (courseVersionId) {
    return `/teacher/course/${courseId}/published/${courseVersionId}`
  }
  return `/teacher/course/${courseId}/published`
}

export function mapPublishedLessonToLessonCard(lesson: PublishedCourseLesson): Lesson {
  return {
    id: lesson.sourceLessonId ?? lesson.id,
    title: lesson.title,
    description: lesson.description,
    content: lesson.content,
    contentSchemaVersion: lesson.contentSchemaVersion,
  }
}

export function mapPublishedTopicToCardProps(
  topic: PublishedCourseTopic,
  themeId?: ThemeId,
): TopicCardProps {
  return {
    id: topic.sourceTopicId ?? topic.id,
    title: topic.title,
    description: topic.description,
    themeId,
  }
}

export function findPublishedTopicInTree(
  tree: PublishedCourseVersion,
  topicCardId: string,
): PublishedCourseTopic | null {
  return tree.topics.find((topic) => (topic.sourceTopicId ?? topic.id) === topicCardId) ?? null
}

export function findPublishedLessonInTopic(
  topic: PublishedCourseTopic,
  lessonCardId: string,
): PublishedCourseLesson | null {
  return (
    topic.lessons.find(
      (lesson) => lesson.sourceLessonId === lessonCardId || lesson.id === lessonCardId,
    ) ?? null
  )
}

export function findPublishedLessonInTree(
  tree: PublishedCourseVersion,
  sourceLessonId: string,
): PublishedCourseLesson | null {
  for (const topic of tree.topics) {
    const match = topic.lessons.find(
      (lesson) => lesson.sourceLessonId === sourceLessonId || lesson.id === sourceLessonId,
    )
    if (match) return match
  }
  return null
}
