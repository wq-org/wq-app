import { supabase } from '@/lib/supabase'
import type { CreateNoteInput, Note, NoteType } from '../types/note.types'

const NOTES_TABLE = 'notes'

function getNoteTypeFromRole(role: string): NoteType {
  return role.toLowerCase() === 'teacher' ? 'lesson' : 'personal'
}

function extractPlainText(content: unknown): string {
  if (typeof content === 'string') return content.trim()
  if (content == null) return ''

  const queue: unknown[] = [content]
  const textParts: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()
    if (typeof current === 'string') {
      textParts.push(current)
      continue
    }

    if (Array.isArray(current)) {
      queue.push(...current)
      continue
    }

    if (typeof current === 'object' && current !== null) {
      const item = current as Record<string, unknown>
      const text = item.text
      if (typeof text === 'string') {
        textParts.push(text)
      }
      queue.push(...Object.values(item))
    }
  }

  return textParts.join(' ').replace(/\s+/g, ' ').trim()
}

function normalizeNote(raw: Record<string, unknown>): Note {
  const now = new Date().toISOString()
  const title =
    typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title : 'Untitled'
  const descriptionFromColumns =
    typeof raw.description === 'string'
      ? raw.description
      : typeof raw.content_html === 'string'
        ? raw.content_html
        : ''
  const description = descriptionFromColumns || extractPlainText(raw.content)

  return {
    id: typeof raw.id === 'string' ? raw.id : `${title}-${now}`,
    user_id: typeof raw.user_id === 'string' ? raw.user_id : '',
    title,
    description,
    content: raw.content ?? null,
    note_type:
      typeof raw.note_type === 'string' && raw.note_type.trim().length > 0
        ? raw.note_type
        : 'personal',
    is_public: raw.is_public === true,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : now,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : now,
  }
}

export async function fetchNotesByUser(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    if (error.code === '42P01') {
      return []
    }
    throw error
  }

  return (data ?? []).map((item) => normalizeNote(item as Record<string, unknown>))
}

function buildInsertAttempts(input: CreateNoteInput): Array<Record<string, unknown>> {
  const noteType = getNoteTypeFromRole(input.role)
  const title = input.title.trim()
  const description = input.description.trim()
  const content = {
    blocks: [
      {
        type: 'paragraph',
        children: [{ text: description }],
      },
    ],
  }

  return [
    {
      user_id: input.userId,
      title,
      description,
      content,
      content_html: description,
      note_type: noteType,
      is_public: noteType === 'lesson',
    },
    {
      user_id: input.userId,
      title,
      content,
      note_type: noteType,
      is_public: noteType === 'lesson',
    },
    {
      user_id: input.userId,
      title,
      description,
    },
    {
      user_id: input.userId,
      title,
      content: description,
    },
  ]
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const title = input.title.trim()
  const description = input.description.trim()

  if (!input.userId) {
    throw new Error('User ID is required to create a note')
  }
  if (!title) {
    throw new Error('Title is required to create a note')
  }
  if (!description) {
    throw new Error('Description is required to create a note')
  }

  const attempts = buildInsertAttempts(input)
  let lastError: string | null = null

  for (const payload of attempts) {
    const { data, error } = await supabase.from(NOTES_TABLE).insert(payload).select('*').single()

    if (!error && data) {
      return normalizeNote(data as Record<string, unknown>)
    }

    if (error?.code === '42P01') {
      throw new Error('Notes table is not available. Run the latest database migration first.')
    }

    lastError = error?.message ?? 'Failed to create note'
  }

  throw new Error(lastError ?? 'Failed to create note')
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from(NOTES_TABLE).delete().eq('id', noteId)

  if (error) {
    console.error('Error deleting note:', error)
    throw error
  }
}
