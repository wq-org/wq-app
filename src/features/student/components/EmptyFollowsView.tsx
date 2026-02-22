import { GraduationCap } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export default function EmptyFollowsView() {
  const { t } = useTranslation('features.course')

  return (
    <div className="w-full animate-fade-in slide-in-from-bottom-5 duration-300 flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 rounded-xl">
      <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
        <GraduationCap className="w-8 h-8 text-gray-400" />
      </div>
      <Text
        as="p"
        variant="body"
        className="mt-3 text-gray-500 text-center text-sm"
      >
        {t('dashboard.empty.noFollowsTitle')}
      </Text>
      <Text
        as="p"
        variant="body"
        className="text-xs text-gray-400 text-center mt-1 flex items-center gap-2"
      >
        {t('dashboard.empty.noFollowsDescription')}
      </Text>
    </div>
  )
}
