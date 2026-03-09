import { Building2 } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function EmptyInstitutionView() {
  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 border border-dashed border-gray-200 rounded-xl p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-gray-50 border border-gray-200 text-gray-400"
        >
          <Building2 className="w-8 h-8 text-gray-400" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-gray-500">
          No institutions available
        </EmptyTitle>
        <EmptyDescription className="text-xs text-gray-400">
          There are currently no institutions to follow. Please check back later.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
