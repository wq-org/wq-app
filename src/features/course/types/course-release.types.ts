import type { Course } from './course.types'
import type { PublishedCourseVersion } from './course-version.types'
import type { Lesson } from '@/features/lesson'
import type { Topic } from '@/features/topic/types/topic.types'

export type ReleaseType = 'none' | 'patch' | 'major'

export type CourseDraftDiffChangeKind = 'added' | 'removed' | 'modified' | 'reordered'

export type CourseDraftDiffFileKind = 'course' | 'topic' | 'lesson'

export type CourseDraftDiffFile = {
  id: string
  label: string
  kind: CourseDraftDiffFileKind
  changeKind: CourseDraftDiffChangeKind
  oldFile: { name: string; content: string }
  newFile: { name: string; content: string }
}

export type CourseDraftDiffSummary = {
  totalChanges: number
  topicsAdded: number
  topicsRemoved: number
  topicsReordered: number
  topicsModified: number
  lessonsAdded: number
  lessonsRemoved: number
  lessonsReordered: number
  lessonsModified: number
  lessonsContentChanged: number
  metadataChanged: boolean
}

export type CourseDraftDiff = {
  summary: CourseDraftDiffSummary
  courseMetadata: {
    titleChanged: boolean
    descriptionChanged: boolean
    themeChanged: boolean
  }
  files: CourseDraftDiffFile[]
  recommendedReleaseType: ReleaseType
  statusLineKeys: CourseReleaseStatusLineKey[]
}

export type CourseReleaseStatusLineKey = {
  key: string
  count?: number
}

export type CourseDraftSnapshot = {
  course: Course
  topics: Array<Topic & { lessons: Lesson[] }>
}

export type CourseReleaseCompareInput = {
  draft: CourseDraftSnapshot
  live: PublishedCourseVersion | null
}

export type LessonReleaseStatus = {
  isInLiveSnapshot: boolean
  liveVersionNo: number | null
  hasDraftDrift: boolean
  diffFileId: string | null
}
