import { supabase } from '@/lib/supabase'
import { isThemeId } from '@/lib/themes'
import {
  NOTE_CONTENT_SCHEMA_VERSION,
  type Note,
  type NoteContentPreview,
  type NoteFormValues,
  type NoteRow,
} from '../types/note.types'

type PostgrestLikeError = { code?: string; message?: string }

function isMissingRpcError(error: unknown, rpcName: string): boolean {
  const e = error as PostgrestLikeError | null
  return (
    e?.code === 'PGRST202' &&
    typeof e.message === 'string' &&
    e.message.includes(rpcName)
  )
}

const NOTE_EDITOR_FIELDS =
  'id, title, description, theme_id, content, content_schema_version, is_pinned, lesson_id, created_at, updated_at'

const NOTE_LIST_FIELDS =
  'id, title, description, theme_id, content_preview, content_schema_version, is_pinned, lesson_id, created_at, updated_at'

type NoteListRow = Omit<NoteRow, 'content'> & {
  content_preview: string | null
}

function parseContentPreview(raw: string | null): NoteContentPreview | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as NoteContentPreview
    return { text: parsed.text ?? null, imageUrl: parsed.imageUrl ?? null }
  } catch {
    return null
  }
}

function toNoteListItem(row: NoteListRow): Note {
  return {
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    themeId: row.theme_id && isThemeId(row.theme_id) ? row.theme_id : null,
    content: null,
    contentSchemaVersion: row.content_schema_version,
    isPinned: row.is_pinned,
    lessonId: row.lesson_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contentPreview: parseContentPreview(row.content_preview),
  }
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    themeId: row.theme_id && isThemeId(row.theme_id) ? row.theme_id : null,
    content: row.content,
    contentSchemaVersion: row.content_schema_version,
    isPinned: row.is_pinned,
    lessonId: row.lesson_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contentPreview: null,
  }
}

export async function listPersonalNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes_list')
    .select(NOTE_LIST_FIELDS)
    .eq('scope', 'personal')
    .is('deleted_at', null)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as NoteListRow[]).map(toNoteListItem)
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select(NOTE_EDITOR_FIELDS)
    .eq('id', noteId)
    .eq('scope', 'personal')
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return toNote(data as NoteRow)
}

export async function createNote(
  values: NoteFormValues,
  institutionId?: string,
): Promise<Note> {
  // Try the RPC first — institution_id is resolved server-side (same pattern as create_teacher_lesson).
  try {
    const { data, error } = await supabase.rpc('create_personal_note', {
      p_title: values.title.trim() || null,
      p_description: values.description.trim() || null,
      p_theme_id: values.themeId,
    })
    if (error) throw error
    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new Error('create_personal_note returned no rows')
    return toNote(row as NoteRow)
  } catch (rpcError) {
    if (!isMissingRpcError(rpcError, 'create_personal_note')) throw rpcError
  }

  // Fallback: direct insert when the RPC migration hasn't been applied yet.
  if (!institutionId) throw new Error('institutionId required for direct note insert')
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notes')
    .insert({
      institution_id: institutionId,
      owner_user_id: userId,
      scope: 'personal',
      title: values.title.trim() || null,
      description: values.description.trim() || null,
      theme_id: values.themeId,
      content: {},
      content_schema_version: NOTE_CONTENT_SCHEMA_VERSION,
    })
    .select(NOTE_EDITOR_FIELDS)
    .single()

  if (error) throw new Error(error.message)
  return toNote(data as NoteRow)
}

export async function updateNoteContent(
  noteId: string,
  content: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ content, content_schema_version: NOTE_CONTENT_SCHEMA_VERSION })
    .eq('id', noteId)

  if (error) throw new Error(error.message)
}

export async function updateNoteHeader(
  noteId: string,
  values: { title?: string; description?: string },
): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update(values)
    .eq('id', noteId)

  if (error) throw new Error(error.message)
}

export async function softDeleteNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', noteId)

  if (error) throw new Error(error.message)
}
