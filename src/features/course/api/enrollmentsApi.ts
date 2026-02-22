import { supabase } from '@/lib/supabase'
import type { Course, CourseEnrollment, EnrollmentStatus } from '../types/course.types'

export interface EnrollmentCourse extends Course {
  teacher?: {
    user_id: string
    display_name?: string | null
    avatar_url?: string | null
  } | null
}

export interface CourseJoinRequestRow extends CourseEnrollment {
  course?: {
    id: string
    title: string
    teacher_id: string
  } | null
  student?: {
    user_id: string
    display_name?: string | null
    avatar_url?: string | null
    username?: string | null
  } | null
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    throw new Error('Not authenticated')
  }

  return user.id
}

export async function requestCourseJoin(courseId: string): Promise<CourseEnrollment> {
  const { data, error } = await supabase.rpc('request_course_join', {
    target_course_id: courseId,
  })

  if (error) {
    console.error('Error requesting course join:', error)
    throw error
  }

  return data as CourseEnrollment
}

export async function respondCourseJoin(
  courseId: string,
  studentId: string,
  action: 'accept' | 'reject',
): Promise<CourseEnrollment> {
  const { data, error } = await supabase.rpc('respond_course_join', {
    target_course_id: courseId,
    target_student_id: studentId,
    action,
  })

  if (error) {
    console.error('Error responding to course join:', error)
    throw error
  }

  return data as CourseEnrollment
}

export async function cancelCourseJoin(courseId: string): Promise<CourseEnrollment> {
  const { data, error } = await supabase.rpc('cancel_course_join', {
    target_course_id: courseId,
  })

  if (error) {
    console.error('Error cancelling course join:', error)
    throw error
  }

  return data as CourseEnrollment
}

export async function getMyCourseRequests(): Promise<CourseJoinRequestRow[]> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('course_enrollments')
    .select(
      `
      course_id,
      student_id,
      status,
      requested_at,
      responded_at,
      responded_by,
      note,
      enrolled_at,
      course:courses!course_enrollments_course_id_fkey(id, title, teacher_id)
    `,
    )
    .eq('student_id', userId)
    .order('requested_at', { ascending: false })

  if (error) {
    console.error('Error fetching my course requests:', error)
    throw error
  }

  return (data || []) as unknown as CourseJoinRequestRow[]
}

export async function getMyAcceptedCourses(): Promise<EnrollmentCourse[]> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('course_enrollments')
    .select(
      `
      status,
      course:courses!course_enrollments_course_id_fkey(
        id,
        title,
        description,
        teacher_id,
        institution_id,
        is_published,
        created_at,
        updated_at,
        teacher:profiles!courses_teacher_id_fkey(user_id, display_name, avatar_url)
      )
    `,
    )
    .eq('student_id', userId)
    .eq('status', 'accepted')
    .order('requested_at', { ascending: false })

  if (error) {
    console.error('Error fetching accepted courses:', error)
    throw error
  }

  return (data || [])
    .map((row) => row.course as unknown as EnrollmentCourse | null)
    .filter((course): course is EnrollmentCourse => Boolean(course))
}

export async function getCourseJoinRequests(courseId?: string): Promise<CourseJoinRequestRow[]> {
  let query = supabase
    .from('course_enrollments')
    .select(
      `
      course_id,
      student_id,
      status,
      requested_at,
      responded_at,
      responded_by,
      note,
      enrolled_at,
      course:courses!course_enrollments_course_id_fkey(id, title, teacher_id),
      student:profiles!course_enrollments_student_id_fkey(user_id, display_name, avatar_url, username)
    `,
    )
    .order('requested_at', { ascending: false })

  if (courseId) {
    query = query.eq('course_id', courseId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching course join requests:', error)
    throw error
  }

  return (data || []) as unknown as CourseJoinRequestRow[]
}

export async function getMyEnrollmentStatusMap(
  courseIds: string[],
): Promise<Record<string, EnrollmentStatus>> {
  if (courseIds.length === 0) return {}

  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('course_id, status, requested_at')
    .eq('student_id', userId)
    .in('course_id', courseIds)
    .order('requested_at', { ascending: false })

  if (error) {
    console.error('Error fetching enrollment statuses:', error)
    throw error
  }

  const statusMap: Record<string, EnrollmentStatus> = {}
  ;(data || []).forEach((row) => {
    if (!statusMap[row.course_id]) {
      statusMap[row.course_id] = row.status as EnrollmentStatus
    }
  })

  return statusMap
}
