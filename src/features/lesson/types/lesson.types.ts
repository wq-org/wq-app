import type { SerializedEditorState } from 'lexical'

export type LessonDraftState = SerializedEditorState

export type LessonBlockTypeRegistryRow = {
  block_type: string
  category: string
  is_lexical_core: boolean
  plugin_key: string | null
  created_at: string
}

/**
 * Lesson metadata row plus optional draft content.
 * The canonical Lexical draft now lives on `lessons.content`.
 */
export type Lesson = {
  id: string
  title: string
  description: string
  content?: LessonDraftState | null
  contentSchemaVersion?: number
  created_at?: string
  updated_at?: string
}

export type LessonTopicRef = {
  id: string
  topic_id: string
}

/** Payload for creating a lesson row; editor body is persisted via `lessons.content`. */
export type CreateLessonData = {
  description: string
  title: string
  topic_id: string
}

export type UpdateLessonData = Partial<{
  content: LessonDraftState
  contentSchemaVersion: number
  description: string
  title: string
}>

export const LESSON_SEARCH_FIELDS = ['title', 'description'] as const
