import type { ThemeId } from '@/lib/themes'

// Course interface, each course has the specified shape
export interface CourseTeacherProfile {
  display_name: string | null
  avatar_url: string | null
}

export type CourseInstitutionProfile = {
  id: string
  name: string | null
}

export type CourseCardReleaseStatus = 'live' | 'offline' | 'draft'

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
  /** Populated by getTeacherCourses list query. */
  teacher_profile?: CourseTeacherProfile | null
  /** Latest published course_versions.version_no; populated by getTeacherCourses. */
  published_version_no?: number | null
  /** Active or scheduled deliveries visible to students; populated by getTeacherCourses. */
  student_visible_delivery_count?: number
  /** Deliveries temporarily hidden from students; populated by getTeacherCourses. */
  offline_delivery_count?: number
}

export type CourseCatalogItem = Course & {
  institution: CourseInstitutionProfile | null
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
  releaseStatus?: CourseCardReleaseStatus
  image?: string
  themeId?: ThemeId
  teacherAvatar?: string
  teacherInitials?: string
  publishedVersionNo?: number
  onView?: (id: string) => void
  /** Called after offline/delete actions from the card menu. */
  onChanged?: () => void
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
