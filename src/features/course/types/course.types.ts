// Course interface, each course has the specified shape
export interface Course {
  id: string // uuid
  title: string // text
  description: string // text
  teacher_id: string // uuid
  institution_id: string // uuid
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
  is_published?: boolean
}

// Type for updating a course (allows partial updates)
export interface UpdateCourseData {
  title?: string
  description?: string
  is_published?: boolean
}

// Course card props for display
export interface CourseCardProps {
  id: string
  title: string
  description: string
  is_published?: boolean
  image?: string
  teacherAvatar?: string
  teacherInitials?: string
  onView?: (id: string) => void
}

export type EnrollmentStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

export interface CourseEnrollment {
  course_id: string
  student_id: string
  status: EnrollmentStatus
  requested_at: string
  responded_at?: string | null
  responded_by?: string | null
  note?: string | null
  enrolled_at?: string
}
