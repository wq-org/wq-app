import type { Note } from '../types/note.types'

export function filterNotesByQuery(notes: readonly Note[], query: string): Note[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...notes]

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(normalized) ||
      note.description.toLowerCase().includes(normalized) ||
      (note.contentPreview?.text ?? '').toLowerCase().includes(normalized),
  )
}
