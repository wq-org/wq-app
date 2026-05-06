import { supabase } from '@/lib/supabase'
import type { CreateLessonData, Lesson, LessonPage, UpdateLessonData } from '../types/lesson.types'

const LESSON_SELECT_FIELDS =
  'id, title, content, pages, description, topic_id, created_at, updated_at'

const LESSON_LIST_SELECT_FIELDS = 'id, title, description, topic_id, created_at, updated_at'

function normalizePersistedPages(rawPages: unknown): LessonPage[] {
  if (!Array.isArray(rawPages)) return []
  return rawPages
    .map((page, index) => {
      if (typeof page !== 'object' || page == null) return null
      const record = page as Record<string, unknown>
      return {
        id: typeof record.id === 'string' ? record.id : `lesson-page-${index}`,
        order: typeof record.order === 'number' ? record.order : index,
        content: typeof record.content === 'string' ? record.content : '',
      } satisfies LessonPage
    })
    .filter((page): page is LessonPage => page != null)
}

function normalizeLessonRow(row: Record<string, unknown>): Lesson {
  const normalizedPages = normalizePersistedPages(row.pages)
  const normalizedContent = typeof row.content === 'string' ? row.content : ''

  return {
    ...(row as unknown as Omit<Lesson, 'pages'>),
    content: normalizedContent,
    pages: normalizedPages,
  }
}

function buildCreateLessonPayload(data: CreateLessonData) {
  return {
    title: data.title.trim(),
    description: data.description || '',
    topic_id: data.topic_id,
    content: data.content ?? '',
    pages: data.pages ?? [],
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

  if (typeof updates.content === 'string') {
    payload.content = updates.content
  }

  return payload
}

export async function createLesson(data: CreateLessonData): Promise<Lesson> {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert(buildCreateLessonPayload(data))
    .select(LESSON_SELECT_FIELDS)
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
    .select(LESSON_SELECT_FIELDS)
    .single()

  if (error) {
    console.error('Error updating lesson:', error)
    throw error
  }

  return normalizeLessonRow(data as Record<string, unknown>)
}

export async function updateLessonPages(lessonId: string, pages: LessonPage[]): Promise<Lesson> {
  const normalizedPages = normalizePersistedPages(pages)

  const { data, error } = await supabase
    .from('lessons')
    .update({
      pages: normalizedPages,
    })
    .eq('id', lessonId)
    .select(LESSON_SELECT_FIELDS)
    .single()

  if (error) {
    console.error('Error updating lesson pages:', error)
    throw error
  }

  return normalizeLessonRow(data as Record<string, unknown>)
}

export async function getLessonById(lessonId: string): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .select(LESSON_SELECT_FIELDS)
    .eq('id', lessonId)
    .single()

  if (error) {
    console.error('Error fetching lesson:', error)
    throw error
  }

  return normalizeLessonRow(data as Record<string, unknown>)
}

export async function fetchLessonWithPages(lessonId: string): Promise<Lesson> {
  return getLessonById(lessonId)
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
    .select(LESSON_LIST_SELECT_FIELDS)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
    throw error
  }

  return (data || []).map((lesson) => normalizeLessonRow(lesson as Record<string, unknown>))
}
