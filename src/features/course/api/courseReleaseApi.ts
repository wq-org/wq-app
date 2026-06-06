import { getTeacherLessonById, getTeacherLessonsByTopicId } from '@/features/lesson'
import { getTopicsByCourseId } from '@/features/topic'

import { getCourseById } from './coursesApi'
import {
  countActiveDeliveriesForVersion,
  getCourseVersionTree,
  getLatestPublishedCourseVersionId,
} from './courseVersionApi'
import type { CourseDraftSnapshot } from '../types/course-release.types'
import type { PublishedCourseVersion } from '../types/course-version.types'

export async function fetchCourseDraftSnapshot(courseId: string): Promise<CourseDraftSnapshot> {
  const course = await getCourseById(courseId)
  const topics = await getTopicsByCourseId(courseId)

  const topicsWithLessons = await Promise.all(
    topics.map(async (topic) => {
      const lessonRows = await getTeacherLessonsByTopicId(topic.id)
      const lessons = await Promise.all(lessonRows.map((row) => getTeacherLessonById(row.id)))
      return { ...topic, lessons }
    }),
  )

  return { course, topics: topicsWithLessons }
}

export async function fetchLatestPublishedCourseTree(
  courseId: string,
): Promise<{ tree: PublishedCourseVersion | null; deliveryCount: number }> {
  const versionId = await getLatestPublishedCourseVersionId(courseId)
  if (!versionId) {
    return { tree: null, deliveryCount: 0 }
  }

  const [tree, deliveryCount] = await Promise.all([
    getCourseVersionTree(versionId),
    countActiveDeliveriesForVersion(versionId),
  ])

  return { tree, deliveryCount }
}
