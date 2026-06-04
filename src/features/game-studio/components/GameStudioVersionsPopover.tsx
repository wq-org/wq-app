'use client'

import { ChevronDown, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Text } from '@/components/ui/text'

import type { GameStudioVersionOption } from '../types/game-studio.types'
import { resolveGameStudioDisplayVersion } from '../utils/resolveGameStudioDisplayVersion'

export type GameStudioVersionsPopoverProps = {
  version?: number
  rollbackVersions?: readonly GameStudioVersionOption[]
  onRollback?: (versionId: string) => void | Promise<void>
  className?: string
}

export function GameStudioVersionsPopover({
  version = 1,
  rollbackVersions = [],
  onRollback,
  className,
}: GameStudioVersionsPopoverProps) {
  const { t } = useTranslation('features.gameStudio')
  const displayVersion = resolveGameStudioDisplayVersion(version)

  const handleRollbackVersion = (versionId: string) => {
    void onRollback?.(versionId)
  }

  return (
    <div className={className ?? 'space-y-2'}>
      <Label className="text-sm font-medium">{t('settingsDrawer.versionLabel')}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            {t('settingsDrawer.versionValue', { version: displayVersion })}
            <ChevronDown className="size-4 shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-3"
        >
          <PopoverHeader>
            <PopoverTitle>{t('settingsDrawer.versionPopoverTitle')}</PopoverTitle>
            <PopoverDescription>
              {t('settingsDrawer.versionPopoverCurrent', { version: displayVersion })}
            </PopoverDescription>
          </PopoverHeader>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t('settingsDrawer.rollbackLabel')}
            </Label>
            {rollbackVersions.length > 0 ? (
              rollbackVersions.map((versionItem) => (
                <Button
                  key={versionItem.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleRollbackVersion(versionItem.id)}
                  disabled={!onRollback}
                >
                  <RotateCcw className="size-4" />
                  {t('settingsDrawer.rollbackToVersion', { version: versionItem.version })}
                </Button>
              ))
            ) : (
              <Text
                as="p"
                variant="small"
                muted
              >
                {t('settingsDrawer.noPreviousVersions')}
              </Text>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
