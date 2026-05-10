import { supabase } from '@/lib/supabase'
import type { CreateLessonData, Lesson, LessonTopicRef, UpdateLessonData } from '../types/lesson.types'

/**
 * Explicit column lists only — no `content`, `pages`, or joins. Body is `lesson_blocks`.
 */
const LESSON_LIST_FIELDS = 'id, title, description, created_at, updated_at'
/** Returned from create / update so list cards keep timestamps without refetch. */
const LESSON_DETAIL_FIELDS = 'id, title, description, created_at, updated_at'
/** Single-lesson header load for the editor — minimal payload. */
const LESSON_HEADER_FETCH_FIELDS = 'id, title, description'
const LESSON_TOPIC_REF_FIELDS = 'id, topic_id'

function normalizeLessonRow(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as string,
    title: typeof row.title === 'string' ? row.title : '',
    description: typeof row.description === 'string' ? row.description : '',
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  }
}

function normalizeLessonTopicRefRow(row: Record<string, unknown>): LessonTopicRef {
  return {
    id: row.id as string,
    topic_id: row.topic_id as string,
  }
}

function buildCreateLessonPayload(data: CreateLessonData) {
  return {
    title: data.title.trim(),
    description: data.description || '',
    topic_id: data.topic_id,
    /** Legacy column: DB NOT NULL until dropped; empty JSON only (body is lesson_blocks). */
    content: {},
  }
}

function buildUpdateLessonPayload(updates: UpdateLessonData) {
  const payload: Record<string, unknown> = {}

  if (typeof updates.title === 'string') {
    payload.title = updates.title.trim()
  }

  if (typeof updates.description === 'string') {
    payload.description = updates.description
  }

  return payload
}

export async function createLesson(data: CreateLessonData): Promise<Lesson> {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert(buildCreateLessonPayload(data))
    .select(LESSON_DETAIL_FIELDS)
    .single()

  if (error) {
    console.error('Error creating lesson:', error)
    throw error
  }

  return normalizeLessonRow(lesson as Record<string, unknown>)
}

export async function updateLesson(lessonId: string, updates: UpdateLessonData): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .update(buildUpdateLessonPayload(updates))
    .eq('id', lessonId)
    .select(LESSON_DETAIL_FIELDS)
    .single()

  if (error) {
    console.error('Error updating lesson:', error)
    throw error
  }

  return normalizeLessonRow(data as Record<string, unknown>)
}

export async function getLessonById(lessonId: string): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .select(LESSON_HEADER_FETCH_FIELDS)
    .eq('id', lessonId)
    .single()

  if (error) {
    console.error('Error fetching lesson:', error)
    throw error
  }

  return normalizeLessonRow(data as Record<string, unknown>)
}

export async function getLessonTopicRefById(lessonId: string): Promise<LessonTopicRef> {
  const { data, error } = await supabase
    .from('lessons')
    .select(LESSON_TOPIC_REF_FIELDS)
    .eq('id', lessonId)
    .single()

  if (error) {
    console.error('Error fetching lesson topic ref:', error)
    throw error
  }

  return normalizeLessonTopicRefRow(data as Record<string, unknown>)
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)

  if (error) {
    console.error('Error deleting lesson:', error)
    throw error
  }
}

export async function getLessonsByTopicId(topicId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select(LESSON_LIST_FIELDS)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
    throw error
  }

  return (data || []).map((lesson) => normalizeLessonRow(lesson as Record<string, unknown>))
}
