import { useParams } from 'react-router-dom'

import {
  PublishedCourseReadOnlyContent,
  PublishedTopicLessonReadOnlyContent,
  PublishedTopicReadOnlyContent,
} from '@/features/course'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const COURSE_BASE_PATH = '/super_admin/courses'
const GAME_BASE_PATH = '/super_admin/games'

export function AdminCourseContentPage() {
  const { courseId, courseVersionId } = useParams<{
    courseId: string
    courseVersionId?: string
  }>()

  return (
    <AdminWorkspaceShell>
      <div className="flex w-full flex-col gap-6 px-4 py-8">
        <PublishedCourseReadOnlyContent
          courseId={courseId}
          courseVersionId={courseVersionId}
          courseBasePath={COURSE_BASE_PATH}
          gameBasePath={GAME_BASE_PATH}
        />
      </div>
    </AdminWorkspaceShell>
  )
}

export function AdminCourseTopicPage() {
  const { courseId, courseVersionId, topicId } = useParams<{
    courseId: string
    courseVersionId: string
    topicId: string
  }>()

  return (
    <AdminWorkspaceShell>
      <div className="flex w-full flex-col gap-6 px-4 py-8">
        <PublishedTopicReadOnlyContent
          courseId={courseId}
          courseVersionId={courseVersionId}
          topicId={topicId}
          courseBasePath={COURSE_BASE_PATH}
        />
      </div>
    </AdminWorkspaceShell>
  )
}

export function AdminCourseTopicLessonPage() {
  const { courseId, courseVersionId, topicId, lessonId } = useParams<{
    courseId: string
    courseVersionId: string
    topicId: string
    lessonId: string
  }>()

  return (
    <AdminWorkspaceShell>
      <div className="flex w-full flex-col gap-6 px-4 py-8">
        <PublishedTopicLessonReadOnlyContent
          courseId={courseId}
          courseVersionId={courseVersionId}
          topicId={topicId}
          lessonId={lessonId}
          courseBasePath={COURSE_BASE_PATH}
        />
      </div>
    </AdminWorkspaceShell>
  )
}
