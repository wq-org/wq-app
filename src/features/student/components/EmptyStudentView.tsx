import { Users, SearchIcon } from 'lucide-react'

export default function EmptyStudentView() {
  return (
    <div className="w-full animate-fade-in slide-in-from-bottom-5 duration-300 flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 rounded-xl">
      <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <p className="mt-3 text-gray-500 text-center text-sm">No students found</p>
      <p className="text-xs text-gray-400 text-center mt-1 flex items-center gap-2">
        Use the command palette to search for students and add them to your class.
        <SearchIcon className="w-4 h-4 text-gray-400" />
      </p>
    </div>
  )
}
