import { Link, useParams } from 'react-router-dom'

import {
  PublishedCourseReadOnlyContent,
  PublishedTopicLessonReadOnlyContent,
  PublishedTopicReadOnlyContent,
} from '@/features/course'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const COURSE_BASE_PATH = '/super_admin/courses'
const GAME_BASE_PATH = '/super_admin/games'

function CourseBreadcrumb({
  courseId,
  courseVersionId,
  topicId,
  page,
}: {
  courseId?: string
  courseVersionId?: string
  topicId?: string
  page: 'course' | 'topic' | 'lesson'
}) {
  const courseDetailHref =
    courseId && courseVersionId
      ? `${COURSE_BASE_PATH}/${courseId}/published/${courseVersionId}`
      : undefined
  const topicHref =
    courseId && courseVersionId && topicId
      ? `${COURSE_BASE_PATH}/${courseId}/published/${courseVersionId}/topic/${topicId}`
      : undefined

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={COURSE_BASE_PATH}>Courses</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {page === 'course' && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Course</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {(page === 'topic' || page === 'lesson') && courseDetailHref && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={courseDetailHref}>Course</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {page === 'topic' && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Topic</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {page === 'lesson' && topicHref && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={topicHref}>Topic</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Lesson</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function AdminCourseContentPage() {
  const { courseId, courseVersionId } = useParams<{
    courseId: string
    courseVersionId?: string
  }>()

  return (
    <AdminWorkspaceShell>
      <div className="flex w-full flex-col gap-4 px-4 py-8">
        <CourseBreadcrumb
          courseId={courseId}
          courseVersionId={courseVersionId}
          page="course"
        />
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
      <div className="flex w-full flex-col gap-4 px-4 py-8">
        <CourseBreadcrumb
          courseId={courseId}
          courseVersionId={courseVersionId}
          topicId={topicId}
          page="topic"
        />
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
      <div className="flex w-full flex-col gap-4 px-4 py-8">
        <CourseBreadcrumb
          courseId={courseId}
          courseVersionId={courseVersionId}
          topicId={topicId}
          page="lesson"
        />
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
