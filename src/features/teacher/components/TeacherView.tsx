import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export function TeacherView() {
  const { t } = useTranslation('features.teacher')

  return (
    <div className="flex flex-col gap-4">
      <Text
        as="h2"
        variant="h2"
        className="text-2xl font-semibold"
      >
        {t('view.title')}
      </Text>
      <Text
        as="p"
        variant="body"
        className="text-gray-600"
      >
        {t('view.description')}
      </Text>
    </div>
  )
}
