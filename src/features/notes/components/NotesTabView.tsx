import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import EmptyNotesView from './EmptyNotesView'
import type { Note } from '../types/note.types'

interface NotesTabViewProps {
  notes: Note[]
  loading: boolean
  onRefresh: () => void
}

function formatNoteDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNoteType(noteType: string): string {
  return noteType.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase())
}

export default function NotesTabView({ notes, loading, onRefresh }: NotesTabViewProps) {
  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-12">
        <Spinner
          variant="gray"
          size="lg"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <div className="w-full py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Create notes from the command palette and they will appear here.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyNotesView />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <article
              key={note.id}
              className="flex min-h-[180px] flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-tight">{note.title}</h3>
                <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                  {formatNoteType(note.note_type)}
                </span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {note.description || 'No content provided.'}
              </p>
              <p className="mt-auto text-xs text-muted-foreground">
                Updated {formatNoteDate(note.updated_at || note.created_at)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
