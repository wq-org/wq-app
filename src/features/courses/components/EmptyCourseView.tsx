import { BookOpen, Plus } from 'lucide-react'
import { Text } from '@/components/ui/text'

export default function EmptyCourseView() {
  return (
    <div className="w-full animate-fade-in slide-in-from-bottom-5 duration-300 flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 rounded-xl">
      <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
        <BookOpen className="w-8 h-8 text-gray-400" />
      </div>
      <Text
        as="p"
        variant="body"
        className="mt-3 text-gray-500 text-center text-sm"
      >
        Erstelle deinen ersten Kurs
      </Text>
      <Text
        as="p"
        variant="body"
        className="text-xs text-gray-400 text-center mt-1 flex items-center gap-2"
      >
        Benutze das Kommando <Plus className="w-4 h-4 text-gray-400" /> in der Befehlsleiste, um
        einen neuen Kurs zu erstellen.
      </Text>
    </div>
  )
}
