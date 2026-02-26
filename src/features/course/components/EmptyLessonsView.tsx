import { FileText, Plus } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function EmptyLessonsView() {
  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 border border-dashed border-gray-200 rounded-xl p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-gray-50 border border-gray-200 text-gray-400"
        >
          <FileText className="w-8 h-8 text-gray-400" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-gray-500">
          füge eine neue Lektion hinzu
        </EmptyTitle>
        <EmptyDescription className="text-xs text-gray-400">
          <span className="inline-flex items-center gap-2">
            Benutze das Eingabefeld und klicke auf das <Plus className="w-4 h-4 text-gray-400" />{' '}
            Symbol, um eine neue Lektion zu erstellen.
          </span>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
