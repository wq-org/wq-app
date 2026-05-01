import type { ThemeId } from '@/lib/themes'

// Course interface, each course has the specified shape
export interface Course {
  id: string // uuid
  title: string // text
  description: string // text
  teacher_id: string // uuid
  institution_id: string // uuid
  theme_id: ThemeId
  is_published: boolean // bool
  created_at: string // timestamptz (ISO string)
  updated_at: string // timestamptz (ISO string)
}

// Type for creating a new course (no id, created_at, updated_at)
export interface CreateCourseData {
  title: string
  description: string
  teacher_id: string
  institution_id?: string // Optional, will be fetched if not provided
  theme_id?: ThemeId
  is_published?: boolean
}

// Type for updating a course (allows partial updates)
export interface UpdateCourseData {
  title?: string
  description?: string
  theme_id?: ThemeId
  is_published?: boolean
}

// Course card props for display
export interface CourseCardProps {
  id: string
  title: string
  description: string
  is_published?: boolean
  image?: string
  themeId?: ThemeId
  teacherAvatar?: string
  teacherInitials?: string
  onView?: (id: string) => void
  className?: string
}

export const COURSE_SEARCH_FIELDS: Array<keyof Course> = ['title', 'description']

export type ProfileCourseCardData = CourseCardProps

export type EnrollmentStatus = 'accepted'

export interface CourseEnrollment {
  course_id: string
  student_id: string
  enrolled_at: string
}
