import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { StickyNote } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

import type { Note } from '../types/note.types'
import { buildNoteEditorRoute } from '../utils/noteRoutes'
import { NoteCard } from './NoteCard'

type NoteCardListProps = {
  notes: Note[]
  role: 'teacher' | 'student'
}

export function NoteCardList({ notes, role }: NoteCardListProps) {
  const { t } = useTranslation('features.notes')
  const navigate = useNavigate()

  const handleClick = useCallback(
    (noteId: string) => {
      navigate(buildNoteEditorRoute(role, noteId))
    },
    [navigate, role],
  )

  if (notes.length === 0) {
    return (
      <Empty className="rounded-2xl border-dashed border-border/70 bg-muted/20 p-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <StickyNote className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('pages.list.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('pages.list.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-row flex-wrap gap-4">
      {notes.map((note, index) => (
        <NoteCard
          key={note.id}
          note={note}
          index={index}
          onClick={handleClick}
        />
      ))}
    </div>
  )
}
