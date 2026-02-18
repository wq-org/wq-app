import { Button } from '@/components/ui/button'
import { RefreshCw, StickyNote } from 'lucide-react'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { HoldToDeleteIconButton } from '@/components/ui/holdDeleteIconButton'
import EmptyNotesView from './EmptyNotesView'
import type { Note } from '../types/note.types'

interface NotesTabViewProps {
  notes: Note[]
  loading: boolean
  onRefresh: () => void
  onDelete?: (noteId: string) => void | Promise<void>
}

function formatNoteDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatNoteType(noteType: string): string {
  return noteType.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase())
}

export default function NotesTabView({ notes, loading, onRefresh, onDelete }: NotesTabViewProps) {
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
        <div className="flex items-center gap-3">
          <Text
            as="h2"
            variant="h2"
            className="text-lg font-semibold"
          >
            Notes
          </Text>
          <Text
            as="span"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {notes.length}
          </Text>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyNotesView />
      ) : (
        <div className="w-full flex flex-col items-center justify-center gap-6">
          <div className="w-full bg-white rounded-4xl shadow p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center text-gray-400 font-light w-[60px]">
                    Type
                  </TableHead>
                  <TableHead className="text-left text-gray-400 font-light">
                    Name
                  </TableHead>
                  <TableHead className="text-left text-gray-400 font-light">
                    Date
                  </TableHead>
                  <TableHead className="text-center text-gray-400 font-light">
                    Note type
                  </TableHead>
                  {onDelete && (
                    <TableHead className="text-center text-gray-400 font-light w-[60px]">
                      Delete
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                    <TableRow
                      key={note.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-200 bg-sky-50">
                            <StickyNote className="h-5 w-5 text-sky-600" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-gray-900">{note.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {note.description || 'No content provided.'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-left text-sm">
                        {formatNoteDate(note.updated_at || note.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {formatNoteType(note.note_type)}
                        </span>
                      </TableCell>
                      {onDelete && (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <HoldToDeleteIconButton
                              size="sm"
                              onDelete={() => onDelete(note.id)}
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
