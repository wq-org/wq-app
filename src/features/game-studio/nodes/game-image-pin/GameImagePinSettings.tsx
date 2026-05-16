import { useTranslation } from 'react-i18next'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

export type GameImagePinSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function GameImagePinSettings({ onDelete }: GameImagePinSettingsProps) {
  const { t } = useTranslation('features.gameStudio')

  return (
    <div className="flex flex-col gap-4">
      <HoldToDeleteButton onDelete={onDelete}>
        {t('imagePinSettings.holdToDeleteNode')}
      </HoldToDeleteButton>
    </div>
  )
}
