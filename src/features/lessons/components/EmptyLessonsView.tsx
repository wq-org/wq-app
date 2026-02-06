import { FileText, Plus } from 'lucide-react'
import { Text } from '@/components/ui/text'

export function EmptyLessonsView() {
  return (
    <div className="w-full animate-fade-in slide-in-from-bottom-5 duration-300 flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 rounded-xl">
      <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <Text
        as="p"
        variant="body"
        className="mt-3 text-gray-500 text-center text-sm"
      >
        füge eine neue Lektion hinzu
      </Text>
      <Text
        as="p"
        variant="body"
        className="text-xs text-gray-400 text-center mt-1 flex items-center gap-2"
      >
        Benutze das Eingabefeld und klicke auf das <Plus className="w-4 h-4 text-gray-400" />{' '}
        Symbol, um eine neue Lektion zu erstellen.
      </Text>
    </div>
  )
}
