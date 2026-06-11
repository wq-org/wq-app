import type { ThemeId } from '@/lib/themes'

export type NoteRow = {
  id: string
  institution_id: string
  owner_user_id: string
  task_group_id: string | null
  scope: 'personal' | 'collaborative'
  title: string | null
  description: string | null
  theme_id: string | null
  content: Record<string, unknown> | null
  content_schema_version: number
  is_pinned: boolean
  lesson_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type NoteContentPreview = {
  text: string | null
  imageUrl: string | null
}

export type Note = {
  id: string
  title: string
  description: string
  themeId: ThemeId | null
  /** Full Lexical editor state — populated by the editor fetch, null for list items. */
  content: Record<string, unknown> | null
  contentSchemaVersion: number
  isPinned: boolean
  lessonId: string | null
  createdAt: string
  updatedAt: string
  /** Lightweight preview — populated for list items, null for editor loads. */
  contentPreview: NoteContentPreview | null
}

export type NoteFormValues = {
  title: string
  description: string
  themeId: ThemeId
}

export const NOTE_CONTENT_SCHEMA_VERSION = 1
