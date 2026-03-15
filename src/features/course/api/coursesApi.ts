import { supabase } from '@/lib/supabase'
import { getUserInstitutionId } from '@/features/auth'
import type { Course, UpdateCourseData } from '../types/course.types'

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

/**
 * Get all courses for a teacher
 */
export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    throw error
  }

  return (data || []) as Course[]
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
