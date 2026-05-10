import { supabase } from '@/lib/supabase'
import type {
  CreateLessonData,
  Lesson,
  LessonPage,
  LessonTopicRef,
  UpdateLessonData,
} from '../types/lesson.types'

/**
 * The slim header shape used by the editor, list, and card UI.
 * Lesson body now lives in `lesson_blocks` — never pull `content` / `pages` here.
 */
const LESSON_LIST_FIELDS = 'id, title, description, created_at, updated_at'
const LESSON_DETAIL_FIELDS = 'id, title, description, created_at, updated_at'
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

function buildCreateLessonPayload(data: CreateLessonData) {
  // Legacy compatibility: baseline schema still defines lessons.content as JSONB NOT NULL.
  // Canonical lesson body remains lesson_blocks; this seed payload only satisfies insert constraints.
  const legacyContent = data.content ? { value: data.content } : {}

  return {
    title: data.title.trim(),
    description: data.description || '',
    topic_id: data.topic_id,
    content: legacyContent,
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

/**
 * Legacy helper retained for compatibility. New code must persist Lexical content via
 * `syncLessonBlocksForLesson` in `lessonBlocksApi`.
 */
export async function updateLessonPages(lessonId: string, pages: LessonPage[]): Promise<Lesson> {
  const normalizedPages = normalizePersistedPages(pages)

  const { data, error } = await supabase
    .from('lessons')
    .update({
      pages: normalizedPages,
    })
    .eq('id', lessonId)
    .select(LESSON_DETAIL_FIELDS)
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
    .select(LESSON_DETAIL_FIELDS)
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
