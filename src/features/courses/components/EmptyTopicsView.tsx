import { TextCursorInput } from 'lucide-react'

export function EmptyTopicsView() {
  return (
    <div className="flex border-4xl flex-col items-center justify-center p-6 border border-dashed border-gray-200 rounded-xl">
      <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
        <TextCursorInput className="w-8 h-8 text-gray-400" />
      </div>
      <p className="mt-3 text-gray-500 text-center text-sm">füge ein neues Thema hinzu</p>
      <p className="text-xs text-gray-400 text-center mt-1">
        Es ist noch kein Thema vorhanden. Bitte nutzen Sie das Eingabefeld und klicken Sie auf das
        Plus-Symbol
      </p>
    </div>
  )
}
