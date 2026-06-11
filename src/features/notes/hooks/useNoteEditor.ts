import { useCallback, useEffect, useState } from 'react'

import { getNoteById, updateNoteContent, updateNoteHeader } from '../api/notesApi'
import type { Note } from '../types/note.types'

export function useNoteEditor(noteId: string | undefined) {
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!noteId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setNote(null)
    getNoteById(noteId)
      .then(setNote)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [noteId])

  const saveContent = useCallback(
    async (content: Record<string, unknown>): Promise<void> => {
      if (!noteId) return
      await updateNoteContent(noteId, content)
    },
    [noteId],
  )

  const saveHeader = useCallback(
    async (values: {
      title?: string
      description?: string
      themeId?: Note['themeId']
    }): Promise<void> => {
      if (!noteId) return
      await updateNoteHeader(noteId, values)
      setNote((prev) => (prev ? { ...prev, ...values } : prev))
    },
    [noteId],
  )

  return { note, loading, error, saveContent, saveHeader }
}
