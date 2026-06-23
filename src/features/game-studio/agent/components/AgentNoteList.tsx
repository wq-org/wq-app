import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import type { Note } from '@/features/notes'

type AgentNoteListProps = {
  notes: Note[]
  onSelectNote: (note: Note) => void
}

export function AgentNoteList({ notes, onSelectNote }: AgentNoteListProps) {
  return (
    <div className="flex flex-col gap-1">
      {notes.map((note) => (
        <Button
          key={note.id}
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start gap-2 px-2 py-2 text-left"
          onClick={() => onSelectNote(note)}
        >
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <Text
            as="span"
            variant="body"
            className="min-w-0 truncate text-sm"
          >
            {note.title || 'Untitled note'}
          </Text>
        </Button>
      ))}
    </div>
  )
}
