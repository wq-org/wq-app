import { GraduationCap } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useTranslation } from 'react-i18next'

export function EmptyFollowsView() {
  const { t } = useTranslation('features.course')

  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 border border-dashed border-gray-200 rounded-xl p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-gray-50 border border-gray-200 text-gray-400"
        >
          <GraduationCap className="w-8 h-8 text-gray-400" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-gray-500">
          {t('dashboard.empty.noFollowsTitle')}
        </EmptyTitle>
        <EmptyDescription className="text-xs text-gray-400">
          {t('dashboard.empty.noFollowsDescription')}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
