import { useCallback, useEffect, useState } from 'react'

import { useUser } from '@/contexts/user'

import { createNote, listPersonalNotes, softDeleteNote } from '../api/notesApi'
import type { Note, NoteFormValues } from '../types/note.types'

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

export function useNotes() {
  const { getUserInstitutionId } = useUser()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    listPersonalNotes()
      .then((data) => setNotes(sortNotes(data)))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const addNote = useCallback(
    async (values: NoteFormValues): Promise<Note> => {
      const institutionId = getUserInstitutionId()
      if (!institutionId) throw new Error('No institution')
      const note = await createNote(values, institutionId)
      setNotes((prev) => sortNotes([note, ...prev]))
      return note
    },
    [getUserInstitutionId],
  )

  const removeNote = useCallback(async (noteId: string): Promise<void> => {
    await softDeleteNote(noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }, [])

  return { notes, loading, error, addNote, removeNote }
}
