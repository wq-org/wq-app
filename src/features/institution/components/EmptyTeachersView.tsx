import { Presentation, SearchIcon } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useTranslation } from 'react-i18next'

export default function EmptyTeachersView() {
  const { t } = useTranslation('features.institution')

  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 border border-dashed border-gray-200 rounded-xl p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-gray-50 border border-gray-200 text-gray-400"
        >
          <Presentation className="w-8 h-8 text-gray-400" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-gray-500">
          {t('emptyTeachers.title')}
        </EmptyTitle>
        <EmptyDescription className="text-xs text-gray-400">
          <span className="inline-flex items-center gap-2">
            {t('emptyTeachers.description')}
            <SearchIcon className="w-4 h-4 text-gray-400" />
          </span>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
