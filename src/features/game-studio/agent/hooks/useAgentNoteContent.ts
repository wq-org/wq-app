import { useEffect, useState } from 'react'
import { getNoteById } from '@/features/notes'
import type { Note } from '@/features/notes'

export function useAgentNoteContent(noteId: string | null) {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!noteId) {
      setNote(null)
      return
    }
    setIsLoading(true)
    setError(null)
    getNoteById(noteId)
      .then(setNote)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [noteId])

  return { note, isLoading, error }
}
