import type { Course, CourseCardProps, CourseCardReleaseStatus } from '../types/course.types'
import type { ClassroomCourseListItem } from '../types/course-version.types'

export function isCourseDeliveryOffline({
  studentVisibleDeliveryCount,
  offlineDeliveryCount,
}: {
  studentVisibleDeliveryCount: number
  offlineDeliveryCount: number
}): boolean {
  return studentVisibleDeliveryCount === 0 && offlineDeliveryCount > 0
}

export function resolveCourseCardReleaseStatus({
  studentVisibleDeliveryCount,
  offlineDeliveryCount,
}: {
  studentVisibleDeliveryCount: number
  offlineDeliveryCount: number
}): CourseCardReleaseStatus {
  if (studentVisibleDeliveryCount > 0) return 'live'
  if (isCourseDeliveryOffline({ studentVisibleDeliveryCount, offlineDeliveryCount }))
    return 'offline'
  return 'draft'
}

export function teacherInitialsFromProfile(displayName?: string | null): string {
  const trimmed = displayName?.trim()
  if (!trimmed) return 'U'

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  }

  return trimmed.slice(0, 2).toUpperCase()
}

export function toCourseCardProps(course: Course | ClassroomCourseListItem): CourseCardProps {
  const deliveredVersionNo =
    'deliveredVersionNo' in course ? course.deliveredVersionNo : course.published_version_no
  const isClassroomDelivery = 'deliveredVersionNo' in course

  const studentVisibleDeliveryCount = isClassroomDelivery
    ? 1
    : (course.student_visible_delivery_count ?? 0)
  const offlineDeliveryCount = isClassroomDelivery ? 0 : (course.offline_delivery_count ?? 0)

  const releaseStatus = resolveCourseCardReleaseStatus({
    studentVisibleDeliveryCount,
    offlineDeliveryCount,
  })

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    is_published: releaseStatus === 'live',
    releaseStatus,
    themeId: course.theme_id,
    teacherAvatar: course.teacher_profile?.avatar_url ?? undefined,
    teacherInitials: teacherInitialsFromProfile(course.teacher_profile?.display_name),
    publishedVersionNo: deliveredVersionNo ?? undefined,
  }
}
