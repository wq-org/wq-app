import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export function GameStudioHelpDrawer() {
  const { t } = useTranslation('features.gameStudio')

  return (
    <div>
      <Text
        as="h1"
        variant="h1"
      >
        {t('helpDrawer.title')}
      </Text>
    </div>
  )
}
