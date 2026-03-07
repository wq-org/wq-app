import { supabase } from '@/lib/supabase'
import type { CreateTopicData, Topic } from '../types/topic.types'

/**
 * Create a new topic for a course.
 */
export async function createTopic(courseId: string, data: CreateTopicData): Promise<Topic> {
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

  const { data: topic, error } = await supabase
    .from('topics')
    .insert({
      title: data.title.trim(),
      description: data.description,
      course_id: courseId,
      order_index: nextOrderIndex,
      created_at: now,
    })
    .select('id, course_id, title, description, order_index, created_at, updated_at')
    .single()

  if (error) {
    console.error('Error creating topic:', error)
    throw error
  }

  return topic as Topic
}

/**
 * Get all topics for a course.
 */
export async function getTopicsByCourseId(courseId: string): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('id, course_id, title, description, order_index, created_at, updated_at')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching topics:', error)
    throw error
  }

  return (data || []) as Topic[]
}

/**
 * Delete a topic.
 */
export async function deleteTopic(topicId: string): Promise<void> {
  const { error } = await supabase.from('topics').delete().eq('id', topicId)

  if (error) {
    console.error('Error deleting topic:', error)
    throw error
  }
}

/**
 * Get a topic by ID.
 */
export async function getTopicById(topicId: string): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('topics')
    .select('id, course_id, title, description, order_index, created_at, updated_at')
    .eq('id', topicId)
    .single()

  if (error || !data) {
    return null
  }

  return data as Topic
}

/**
 * Update a topic by ID.
 */
export async function updateTopic(
  topicId: string,
  updates: Partial<{ title: string; description: string }>,
): Promise<Topic> {
  const payload: Partial<{ title: string; description: string }> = {}

  if (typeof updates.title === 'string') {
    payload.title = updates.title.trim()
  }

  if (typeof updates.description === 'string') {
    payload.description = updates.description
  }

  const { data, error } = await supabase
    .from('topics')
    .update(payload)
    .eq('id', topicId)
    .select('id, course_id, title, description, order_index, created_at, updated_at')
    .single()

  if (error) {
    console.error('Error updating topic:', error)
    throw error
  }

  return data as Topic
}
