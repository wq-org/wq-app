import { BookOpen, Plus } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function EmptyCourseView() {
  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 border border-dashed border-border rounded-xl p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-muted border border-border text-muted-foreground"
        >
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-muted-foreground">
          Erstelle deinen ersten Kurs
        </EmptyTitle>
        <EmptyDescription className="text-xs text-muted-foreground/80">
          <span className="inline-flex items-center gap-2">
            Benutze das Kommando <Plus className="w-4 h-4 text-muted-foreground" /> in der
            Befehlsleiste, um einen neuen Kurs zu erstellen.
          </span>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
