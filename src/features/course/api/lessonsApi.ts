import { supabase } from '@/lib/supabase'
import type { Lesson, CreateLessonData } from '../types/lesson.types'

/**
 * Create a new lesson
 */
export async function createLesson(data: CreateLessonData): Promise<Lesson> {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      title: data.title.trim(),
      content: data.content || '',
      description: data.description || '',
      topic_id: data.topic_id,
    })
    .select('id, title, content, description, topic_id')
    .single()

  if (error) {
    console.error('Error creating lesson:', error)
    throw error
  }

  return lesson as Lesson
}

/**
 * Update a lesson
 */
export async function updateLesson(
  lessonId: string,
  updates: Partial<{ title: string; content: string; description: string }>,
): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId)
    .select('id, title, content, description, topic_id')
    .single()

  if (error) {
    console.error('Error updating lesson:', error)
    throw error
  }

  return data as Lesson
}

/**
 * Get a single lesson by ID
 */
export async function getLessonById(lessonId: string): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, content, description, topic_id')
    .eq('id', lessonId)
    .single()

  if (error) {
    console.error('Error fetching lesson:', error)
    throw error
  }

  return data as Lesson
}

/**
 * Delete a lesson
 */
export async function deleteLesson(lessonId: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)

  if (error) {
    console.error('Error deleting lesson:', error)
    throw error
  }
}

/**
 * Get all lessons for a topic
 */
export async function getLessonsByTopicId(topicId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, topic_id, content, description')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
    throw error
  }

  return (data || []) as Lesson[]
}
