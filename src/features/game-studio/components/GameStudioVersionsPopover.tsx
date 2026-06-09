import { useTranslation } from 'react-i18next'

import { Label } from '@/components/ui/label'

import { resolveGameStudioDisplayVersion } from '../utils/resolveGameStudioDisplayVersion'

export type GameStudioVersionsPopoverProps = {
  version?: number
  className?: string
}

export function GameStudioVersionsPopover({
  version = 1,
  className,
}: GameStudioVersionsPopoverProps) {
  const { t } = useTranslation('features.gameStudio')
  const displayVersion = resolveGameStudioDisplayVersion(version)

  return (
    <div className={className ?? 'space-y-2'}>
      <Label className="text-sm font-medium">{t('settingsDrawer.versionLabel')}</Label>
      <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
        {t('settingsDrawer.versionValue', { version: displayVersion })}
      </div>
    </div>
  )
}
