import { supabase } from '@/lib/supabase'
import { getUserInstitutionId } from '@/features/auth/api/authApi'
import type { Course, UpdateCourseData } from '../types/course.types'

/**
 * Create a new course
 */
export async function createCourse(
  teacherId: string,
  { title, description }: { title: string; description: string },
): Promise<Course> {
  const institutionId = await getUserInstitutionId(teacherId)

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title,
      description,
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

/**
 * Create a new topic for a course
 */
export async function createTopic(
  courseId: string,
  name: string,
): Promise<{ id: string; name: string; course_id: string }> {
  const now = new Date().toISOString()

  const { data: existingTopics, error: fetchError } = await supabase
    .from('topics')
    .select('order_index')
    .eq('course_id', courseId)
    .order('order_index', { ascending: false })
    .limit(1)

  if (fetchError) {
    console.error('Error fetching existing topics:', fetchError)
    throw fetchError
  }

  const nextOrderIndex =
    existingTopics && existingTopics.length > 0 ? (existingTopics[0].order_index ?? -1) + 1 : 0

  const { data, error } = await supabase
    .from('topics')
    .insert({
      title: name.trim(),
      course_id: courseId,
      order_index: nextOrderIndex,
      created_at: now,
    })
    .select('id, title, course_id, created_at, updated_at')
    .single()

  if (error) {
    console.error('Error creating topic:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.title,
    course_id: data.course_id,
  }
}

/**
 * Get all topics for a course
 */
export async function getTopicsByCourseId(
  courseId: string,
): Promise<{ id: string; name: string; course_id: string }[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('id, title, course_id')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching topics:', error)
    throw error
  }

  return (data || []).map((topic) => ({
    id: topic.id,
    name: topic.title,
    course_id: topic.course_id,
  }))
}

/**
 * Delete a topic
 */
export async function deleteTopic(topicId: string): Promise<void> {
  const { error } = await supabase.from('topics').delete().eq('id', topicId)

  if (error) {
    console.error('Error deleting topic:', error)
    throw error
  }
}

/**
 * Get a topic by ID (returns course_id for redirects)
 */
export async function getTopicById(
  topicId: string,
): Promise<{ id: string; course_id: string } | null> {
  const { data, error } = await supabase
    .from('topics')
    .select('id, course_id')
    .eq('id', topicId)
    .single()

  if (error || !data) return null
  return data as { id: string; course_id: string }
}
