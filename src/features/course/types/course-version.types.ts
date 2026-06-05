import type { ThemeId } from '@/lib/themes'
import type { LessonDraftState } from '@/features/lesson/types/lesson.types'

export type CourseVersionStatus = 'draft' | 'published' | 'archived'

export type CourseVersionRow = {
  id: string
  institution_id: string
  course_id: string
  version_no: number
  status: CourseVersionStatus
  published_at: string | null
  has_pending_changes: boolean | null
  title: string | null
  description: string | null
  theme_id: ThemeId | null
  created_at: string
  updated_at: string
}

export type CourseVersionTopicRow = {
  id: string
  course_version_id: string
  source_topic_id: string | null
  title: string
  description: string | null
  order_index: number
  course_version_lessons: CourseVersionLessonRow[] | null
}

export type CourseVersionLessonRow = {
  id: string
  course_version_topic_id: string
  source_lesson_id: string | null
  title: string
  description: string | null
  content: LessonDraftState
  pages: unknown
  order_index: number
  content_schema_version: number
}

export type CourseVersionTreeRow = CourseVersionRow & {
  /** @deprecated Legacy join; prefer snapshot columns on course_versions. */
  courses?:
    | {
        id: string
        title: string
        description: string
        theme_id: ThemeId
      }
    | {
        id: string
        title: string
        description: string
        theme_id: ThemeId
      }[]
    | null
  course_version_topics: CourseVersionTopicRow[] | null
}

export type ClassroomCourseDeliveryRow = {
  id: string
  course_id: string
  course_version_id: string
  published_at: string | null
}

export type ClassroomCourseDeliveryListRow = {
  id: string
  course_id: string
  course_version_id: string
  course_versions:
    | {
        version_no: number
        status: string
        title: string | null
        description: string | null
        theme_id: ThemeId | null
      }
    | {
        version_no: number
        status: string
        title: string | null
        description: string | null
        theme_id: ThemeId | null
      }[]
    | null
  courses: ClassroomCourseEmbed | ClassroomCourseEmbed[] | null
}

type ClassroomCourseEmbed = {
  id: string
  title: string
  description: string
  teacher_id: string
  institution_id: string
  theme_id: ThemeId
  is_published: boolean
  created_at: string
  updated_at: string
  teacher: { display_name: string | null; avatar_url: string | null } | null
  course_versions: Array<{ version_no: number; status: string }> | null
}

export type PublishedCourseLesson = {
  id: string
  sourceLessonId: string | null
  title: string
  description: string
  content: LessonDraftState | null
  pages: unknown
  orderIndex: number
  contentSchemaVersion: number
}

export type PublishedCourseTopic = {
  id: string
  sourceTopicId: string | null
  title: string
  description: string
  orderIndex: number
  lessons: PublishedCourseLesson[]
}

export type PublishedCourseVersion = {
  id: string
  courseId: string
  versionNo: number
  status: CourseVersionStatus
  publishedAt: Date | null
  hasPendingChanges: boolean
  courseTitle: string
  courseDescription: string
  themeId: ThemeId
  topics: PublishedCourseTopic[]
}

export type PublishedCourseVersionSummary = {
  id: string
  versionNo: number
  publishedAt: Date | null
  status: CourseVersionStatus
}

export type ClassroomCourseDelivery = {
  deliveryId: string
  courseId: string
  courseVersionId: string
  publishedAt: Date | null
}

export type ClassroomCourseListItem = import('./course.types').Course & {
  deliveryId: string
  courseVersionId: string
  deliveredVersionNo: number | null
}

export type CourseVersionHistorySummaryRow = {
  id: string
  versionNo: number
  status: 'published' | 'archived'
  publishedAt: Date | null
  createdAt: Date
  activeDeliveryCount: number
}
