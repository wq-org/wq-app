import { supabase } from '@/lib/supabase'
import { normalizeLessonDraftState } from '../utils/lessonDraftState'
import {
  LESSON_CONTENT_SCHEMA_VERSION,
  resolveLessonDraftState,
} from '../utils/createDefaultLessonLexicalState'
import type {
  CreateLessonData,
  Lesson,
  LessonTopicRef,
  UpdateLessonData,
} from '../types/lesson.types'

/**
 * Explicit column lists only. Lesson draft content now lives on `lessons.content`.
 */
const LESSON_LIST_FIELDS = 'id, title, description, created_at, updated_at'
/** Single-lesson load for the editor — include draft content. */
const LESSON_HEADER_FETCH_FIELDS = 'id, title, description, content, content_schema_version'

type RpcArgs = Record<string, unknown>
type PostgrestLikeError = {
  code?: string
  message?: string
}

function isMissingRpcError(error: unknown, rpcName: string): boolean {
  const candidate = error as PostgrestLikeError | null
  return (
    candidate?.code === 'PGRST202' &&
    typeof candidate.message === 'string' &&
    candidate.message.includes(rpcName)
  )
}

async function getSingleRpcRow(
  rpcName: string,
  args: RpcArgs,
  emptyMessage: string,
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc(rpcName, args)

  if (error) {
    console.error(`Error calling RPC ${rpcName}:`, error)
    throw error
  }

  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null | undefined
  if (!row) {
    throw new Error(emptyMessage)
  }

  return row
}

async function getManyRpcRows(rpcName: string, args: RpcArgs): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase.rpc(rpcName, args)

  if (error) {
    console.error(`Error calling RPC ${rpcName}:`, error)
    throw error
  }

  return (data as Record<string, unknown>[] | null) ?? []
}

function normalizeLessonRow(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as string,
    title: typeof row.title === 'string' ? row.title : '',
    description: typeof row.description === 'string' ? row.description : '',
    content: row.content !== undefined ? normalizeLessonDraftState(row.content) : undefined,
    contentSchemaVersion:
      typeof row.content_schema_version === 'number' ? row.content_schema_version : undefined,
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
    content: resolveLessonDraftState(data.content),
    contentSchemaVersion: data.contentSchemaVersion ?? LESSON_CONTENT_SCHEMA_VERSION,
    title: data.title.trim(),
    description: data.description || '',
    topic_id: data.topic_id,
  }
}

function buildUpdateLessonPayload(updates: UpdateLessonData): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (typeof updates.title === 'string') {
    payload.title = updates.title.trim()
  }

  if (typeof updates.description === 'string') {
    payload.description = updates.description
  }

  if (updates.content !== undefined) {
    payload.content = updates.content
  }

  if (typeof updates.contentSchemaVersion === 'number') {
    payload.content_schema_version = updates.contentSchemaVersion
  }

  return payload
}

export async function createLesson(data: CreateLessonData): Promise<Lesson> {
  const payload = buildCreateLessonPayload(data)
  try {
    const lesson = await getSingleRpcRow(
      'create_teacher_lesson',
      {
        p_topic_id: payload.topic_id,
        p_title: payload.title,
        p_description: payload.description,
        p_content: payload.content,
        p_content_schema_version: payload.contentSchemaVersion,
      },
      'Teacher lesson create returned no data',
    )

    return normalizeLessonRow(lesson)
  } catch (error) {
    if (!isMissingRpcError(error, 'create_teacher_lesson')) {
      throw error
    }

    const { data: lesson, error: fallbackError } = await supabase
      .from('lessons')
      .insert({
        title: payload.title,
        description: payload.description,
        topic_id: payload.topic_id,
        content: payload.content,
        content_schema_version: payload.contentSchemaVersion,
      })
      .select(LESSON_HEADER_FETCH_FIELDS + ', created_at, updated_at')
      .single()

    if (fallbackError) {
      console.error('Error creating lesson via fallback query:', fallbackError)
      throw fallbackError
    }

    return normalizeLessonRow(lesson as unknown as Record<string, unknown>)
  }
}

export async function updateLesson(lessonId: string, updates: UpdateLessonData): Promise<Lesson> {
  const payload = buildUpdateLessonPayload(updates)
  try {
    const data = await getSingleRpcRow(
      'update_teacher_lesson',
      {
        p_lesson_id: lessonId,
        p_updates: payload,
      },
      'Teacher lesson update returned no data',
    )

    return normalizeLessonRow(data)
  } catch (error) {
    if (!isMissingRpcError(error, 'update_teacher_lesson')) {
      throw error
    }

    const { data, error: fallbackError } = await supabase
      .from('lessons')
      .update(payload)
      .eq('id', lessonId)
      .select(LESSON_HEADER_FETCH_FIELDS + ', created_at, updated_at')
      .single()

    if (fallbackError) {
      console.error('Error updating lesson via fallback query:', fallbackError)
      throw fallbackError
    }

    return normalizeLessonRow(data as unknown as Record<string, unknown>)
  }
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

export async function getTeacherLessonById(lessonId: string): Promise<Lesson> {
  try {
    const data = await getSingleRpcRow(
      'get_teacher_lesson',
      { p_lesson_id: lessonId },
      'Teacher lesson lookup returned no data',
    )

    return normalizeLessonRow(data)
  } catch (error) {
    if (!isMissingRpcError(error, 'get_teacher_lesson')) {
      throw error
    }

    return getLessonById(lessonId)
  }
}

export async function getTeacherLessonTopicRefById(lessonId: string): Promise<LessonTopicRef> {
  try {
    const data = await getSingleRpcRow(
      'get_teacher_lesson_topic_ref',
      { p_lesson_id: lessonId },
      'Teacher lesson topic ref lookup returned no data',
    )

    return normalizeLessonTopicRefRow(data as Record<string, unknown>)
  } catch (error) {
    if (!isMissingRpcError(error, 'get_teacher_lesson_topic_ref')) {
      throw error
    }

    const { data, error: fallbackError } = await supabase
      .from('lessons')
      .select('id, topic_id')
      .eq('id', lessonId)
      .single()

    if (fallbackError) {
      console.error('Error fetching lesson topic ref via fallback query:', fallbackError)
      throw fallbackError
    }

    return normalizeLessonTopicRefRow(data as Record<string, unknown>)
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_teacher_lesson', { p_lesson_id: lessonId })

  if (!error) {
    return
  }

  if (!isMissingRpcError(error, 'delete_teacher_lesson')) {
    console.error('Error deleting lesson:', error)
    throw error
  }

  const { error: fallbackError } = await supabase.from('lessons').delete().eq('id', lessonId)
  if (fallbackError) {
    console.error('Error deleting lesson via fallback query:', fallbackError)
    throw fallbackError
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

export async function getTeacherLessonsByTopicId(topicId: string): Promise<Lesson[]> {
  try {
    const data = await getManyRpcRows('list_teacher_lessons_by_topic', { p_topic_id: topicId })
    return data.map((lesson) => normalizeLessonRow(lesson))
  } catch (error) {
    if (!isMissingRpcError(error, 'list_teacher_lessons_by_topic')) {
      throw error
    }

    return getLessonsByTopicId(topicId)
  }
}
