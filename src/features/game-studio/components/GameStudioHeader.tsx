import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export default function GameStudioHeader() {
  const { t } = useTranslation('features.gameStudio')

  return (
    <div>
      <Text
        as="h1"
        variant="h1"
      >
        {t('header.title')}
      </Text>
    </div>
  )
}
