import type { Course, CourseCardProps } from '../types/course.types'

export function teacherInitialsFromProfile(displayName?: string | null): string {
  const trimmed = displayName?.trim()
  if (!trimmed) return 'U'

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  }

  return trimmed.slice(0, 2).toUpperCase()
}

export function toCourseCardProps(course: Course): CourseCardProps {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    is_published: course.is_published,
    themeId: course.theme_id,
    teacherAvatar: course.teacher_profile?.avatar_url ?? undefined,
    teacherInitials: teacherInitialsFromProfile(course.teacher_profile?.display_name),
    publishedVersionNo: course.published_version_no ?? undefined,
  }
}
