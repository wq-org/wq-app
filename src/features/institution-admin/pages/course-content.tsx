import { useParams } from 'react-router-dom'

import {
  PublishedCourseReadOnlyContent,
  PublishedTopicLessonReadOnlyContent,
  PublishedTopicReadOnlyContent,
} from '@/features/course'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const COURSE_BASE_PATH = '/institution_admin/courses'
const GAME_BASE_PATH = '/institution_admin/games'

export function InstitutionAdminCourseContentPage() {
  const { courseId, courseVersionId } = useParams<{
    courseId: string
    courseVersionId?: string
  }>()

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <PublishedCourseReadOnlyContent
          courseId={courseId}
          courseVersionId={courseVersionId}
          courseBasePath={COURSE_BASE_PATH}
          gameBasePath={GAME_BASE_PATH}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export function InstitutionAdminCourseTopicPage() {
  const { courseId, courseVersionId, topicId } = useParams<{
    courseId: string
    courseVersionId: string
    topicId: string
  }>()

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <PublishedTopicReadOnlyContent
          courseId={courseId}
          courseVersionId={courseVersionId}
          topicId={topicId}
          courseBasePath={COURSE_BASE_PATH}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export function InstitutionAdminCourseTopicLessonPage() {
  const { courseId, courseVersionId, topicId, lessonId } = useParams<{
    courseId: string
    courseVersionId: string
    topicId: string
    lessonId: string
  }>()

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <PublishedTopicLessonReadOnlyContent
          courseId={courseId}
          courseVersionId={courseVersionId}
          topicId={topicId}
          lessonId={lessonId}
          courseBasePath={COURSE_BASE_PATH}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
