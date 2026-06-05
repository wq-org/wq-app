import { supabase } from '@/lib/supabase'
import { getUserInstitutionId } from '@/features/auth'
import type { Course, CourseTeacherProfile, UpdateCourseData } from '../types/course.types'

/**
 * Create a new course
 */
export async function createCourse(
  teacherId: string,
  {
    title,
    description,
    theme_id,
  }: { title: string; description: string; theme_id?: UpdateCourseData['theme_id'] },
): Promise<Course> {
  const institutionId = await getUserInstitutionId(teacherId)

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title,
      description,
      ...(theme_id ? { theme_id } : {}),
      teacher_id: teacherId,
      institution_id: institutionId,
      is_published: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating course:', error)
    throw error
  }

  return data as Course
}

type TeacherCourseRow = Omit<Course, 'teacher_profile' | 'published_version_no'> & {
  teacher: CourseTeacherProfile | null
  course_versions: Array<{ version_no: number; status: string }> | null
}

export function mapTeacherCourseRow(row: TeacherCourseRow): Course {
  const { teacher, course_versions, ...course } = row
  const publishedVersionNo = (course_versions ?? [])
    .filter((version) => version.status === 'published')
    .reduce((max, version) => Math.max(max, version.version_no), 0)

  return {
    ...course,
    teacher_profile: teacher ?? null,
    published_version_no: publishedVersionNo > 0 ? publishedVersionNo : null,
  }
}

/**
 * Get all courses for a teacher
 */
export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      teacher:profiles!courses_teacher_id_fkey(display_name, avatar_url),
      course_versions(version_no, status)
    `,
    )
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    throw error
  }

  return ((data || []) as TeacherCourseRow[]).map(mapTeacherCourseRow)
}

/** Published courses for the teacher (e.g. optional game link on publish). */
export async function getTeacherPublishedCourses(teacherId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(
      'id, title, description, teacher_id, institution_id, theme_id, is_published, created_at, updated_at',
    )
    .eq('teacher_id', teacherId)
    .eq('is_published', true)
    .order('title', { ascending: true })

  if (error) {
    console.error('Error fetching published courses:', error)
    throw error
  }

  return (data || []) as Course[]
}

type ClassroomCourseDeliveryRow = {
  course_id: string
  courses: TeacherCourseRow | TeacherCourseRow[] | null
}

/** Courses delivered to a classroom via course_deliveries (deduped, newest delivery first). */
export async function getClassroomCourses(classroomId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('course_deliveries')
    .select(
      `
      course_id,
      courses (
        *,
        teacher:profiles!courses_teacher_id_fkey(display_name, avatar_url),
        course_versions(version_no, status)
      )
    `,
    )
    .eq('classroom_id', classroomId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching classroom courses:', error)
    throw error
  }

  const seenCourseIds = new Set<string>()
  const courses: Course[] = []

  for (const row of (data ?? []) as ClassroomCourseDeliveryRow[]) {
    if (seenCourseIds.has(row.course_id)) continue

    const embedded = row.courses
    const courseRow = Array.isArray(embedded) ? embedded[0] : embedded
    if (!courseRow) continue

    seenCourseIds.add(row.course_id)
    courses.push(mapTeacherCourseRow(courseRow))
  }

  return courses
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string): Promise<Course> {
  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()

  if (error) {
    console.error('Error fetching course:', error)
    throw error
  }

  return data as Course
}

/**
 * Update a course
 */
export async function updateCourse(courseId: string, updates: UpdateCourseData): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select()
    .single()

  if (error) {
    console.error('Error updating course:', error)
    throw error
  }

  return data as Course
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', courseId)

  if (error) {
    console.error('Error deleting course:', error)
    throw error
  }
}
