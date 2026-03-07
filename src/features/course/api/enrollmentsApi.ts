import { supabase } from '@/lib/supabase'
import type { Course, CourseEnrollment, EnrollmentStatus } from '../types/course.types'

export interface EnrollmentCourse extends Course {
  teacher?: {
    user_id: string
    display_name?: string | null
    avatar_url?: string | null
  } | null
}

export type CourseMemberType = 'teacher' | 'student'

export interface CourseMember {
  id: string
  title: string
  email: string | null
  avatar_url: string | null
  type: CourseMemberType
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

async function getExistingEnrollment(
  courseId: string,
  studentId: string,
): Promise<CourseEnrollment | null> {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('course_id, student_id, enrolled_at')
    .eq('course_id', courseId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) {
    console.error('Error loading existing enrollment:', error)
    throw error
  }

  return (data as CourseEnrollment | null) ?? null
}

export async function requestCourseJoin(courseId: string): Promise<CourseEnrollment> {
  const studentId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      course_id: courseId,
      student_id: studentId,
    })
    .select('course_id, student_id, enrolled_at')
    .single()

  if (!error && data) {
    return data as CourseEnrollment
  }

  // Already enrolled should be treated as success for idempotent "join" actions.
  if (error?.code === '23505') {
    const existing = await getExistingEnrollment(courseId, studentId)
    if (existing) {
      return existing
    }
  }

  console.error('Error joining course:', error)
  throw error
}

export async function cancelCourseJoin(courseId: string): Promise<void> {
  const studentId = await getCurrentUserId()

  const { error } = await supabase
    .from('course_enrollments')
    .delete()
    .eq('course_id', courseId)
    .eq('student_id', studentId)

  if (error) {
    console.error('Error leaving course:', error)
    throw error
  }
}

export async function getMyAcceptedCourses(): Promise<EnrollmentCourse[]> {
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('course_enrollments')
    .select(
      `
      enrolled_at,
      course:courses!course_enrollments_course_id_fkey(
        id,
        title,
        description,
        teacher_id,
        institution_id,
        theme_id,
        is_published,
        created_at,
        updated_at,
        teacher:profiles!courses_teacher_id_fkey(user_id, display_name, avatar_url)
      )
    `,
    )
    .eq('student_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) {
    console.error('Error fetching accepted courses:', error)
    throw error
  }

  return (data || [])
    .map((row) => row.course as unknown as EnrollmentCourse | null)
    .filter((course): course is EnrollmentCourse => Boolean(course))
}

export async function getMyEnrollmentStatusMap(
  courseIds: string[],
): Promise<Record<string, EnrollmentStatus>> {
  if (courseIds.length === 0) return {}

  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('student_id', userId)
    .in('course_id', courseIds)

  if (error) {
    console.error('Error fetching enrollment statuses:', error)
    throw error
  }

  const statusMap: Record<string, EnrollmentStatus> = {}
  ;(data || []).forEach((row) => {
    if (!statusMap[row.course_id]) {
      statusMap[row.course_id] = 'accepted'
    }
  })

  return statusMap
}

export async function getCourseMembers(courseId: string): Promise<CourseMember[]> {
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('teacher_id')
    .eq('id', courseId)
    .single()

  if (courseError) {
    console.error('Error fetching course owner:', courseError)
    throw courseError
  }

  const teacherId = course?.teacher_id as string | undefined
  if (!teacherId) return []

  const { data: enrollments, error: enrollmentError } = await supabase
    .from('course_enrollments')
    .select('student_id, enrolled_at')
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: true })

  if (enrollmentError) {
    console.error('Error fetching course enrollments:', enrollmentError)
    throw enrollmentError
  }

  const memberIds = new Set<string>([teacherId])
  ;(enrollments || []).forEach((row) => {
    if (row.student_id) {
      memberIds.add(row.student_id)
    }
  })

  const idList = [...memberIds]

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, display_name, username, email, avatar_url')
    .in('user_id', idList)

  if (profilesError) {
    console.error('Error fetching course member profiles:', profilesError)
    throw profilesError
  }

  const profileById = new Map((profiles || []).map((profile) => [profile.user_id, profile]))

  const teacherProfile = profileById.get(teacherId)
  const teacherMember: CourseMember = {
    id: teacherId,
    title: teacherProfile?.display_name || teacherProfile?.username || 'Teacher',
    email: teacherProfile?.email ?? null,
    avatar_url: teacherProfile?.avatar_url ?? null,
    type: 'teacher',
  }

  const studentMembers: CourseMember[] = (enrollments || [])
    .map((row) => row.student_id)
    .filter((studentId): studentId is string => Boolean(studentId))
    .map((studentId) => {
      const profile = profileById.get(studentId)
      return {
        id: studentId,
        title: profile?.display_name || profile?.username || 'Student',
        email: profile?.email ?? null,
        avatar_url: profile?.avatar_url ?? null,
        type: 'student' as const,
      }
    })

  return [teacherMember, ...studentMembers]
}
