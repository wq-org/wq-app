import { supabase } from '@/lib/supabase'
import { buildLessonPages, createLessonPage, serializeLessonContent } from '../utils/lessonPages'
import type { CreateLessonData, Lesson, LessonPage, UpdateLessonData } from '../types/lesson.types'
import { createDefaultLessonContent } from '../utils/createDefaultLessonContent'
import { createLessonStarterContentJson } from '../utils/createLessonStarterContent'

const LESSON_SELECT_FIELDS =
  'id, title, content, pages, description, topic_id, created_at, updated_at'

function normalizePersistedPages(rawPages: unknown, fallbackContent?: unknown): LessonPage[] {
  return buildLessonPages(rawPages, fallbackContent)
}

function normalizeLessonRow(row: Record<string, unknown>): Lesson {
  const normalizedPages = normalizePersistedPages(row.pages, row.content)

  return {
    ...(row as unknown as Omit<Lesson, 'pages'>),
    content: serializeLessonContent(normalizedPages),
    pages: normalizedPages,
  }
}

function buildCreateLessonPayload(data: CreateLessonData) {
  const hasExplicitContent = Boolean(data.content?.trim())
  const fallbackContent = hasExplicitContent ? data.content : createDefaultLessonContent()
  const normalizedPages = normalizePersistedPages(data.pages, fallbackContent)

  return {
    title: data.title.trim(),
    description: data.description || '',
    topic_id: data.topic_id,
    content: serializeLessonContent(normalizedPages),
    pages: normalizedPages,
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

  if (Array.isArray(updates.pages)) {
    const normalizedPages = normalizePersistedPages(
      updates.pages.length > 0 ? updates.pages : [createLessonPage(0)],
    )
    payload.pages = normalizedPages
    payload.content = serializeLessonContent(normalizedPages)
    return payload
  }

  if (typeof updates.content === 'string') {
    const normalizedContent = updates.content.trim()
      ? updates.content
      : createLessonStarterContentJson()
    const normalizedPages = normalizePersistedPages(undefined, normalizedContent)
    payload.content = serializeLessonContent(normalizedPages)
    payload.pages = normalizedPages
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
  const normalizedPages = normalizePersistedPages(pages.length > 0 ? pages : [createLessonPage(0)])

  const { data, error } = await supabase
    .from('lessons')
    .update({
      content: serializeLessonContent(normalizedPages),
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
    .select(LESSON_SELECT_FIELDS)
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
    throw error
  }

  return (data || []).map((lesson) => normalizeLessonRow(lesson as Record<string, unknown>))
}
