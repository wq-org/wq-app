'use client'

import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export type IfElseBranchDividerProps = {
  score: number
  threshold: number
  nextNodeLabel?: string | null
}

export function IfElseBranchDivider({ score, threshold, nextNodeLabel }: IfElseBranchDividerProps) {
  const { t } = useTranslation('features.gameStudio')
  const connected = Boolean(nextNodeLabel?.trim())

  return (
    <div className="flex flex-col gap-3 py-2">
      <Separator />
      <Alert variant={connected ? 'orange' : 'destructive'}>
        <AlertTitle>{t('ifElsePreview.title')}</AlertTitle>
        <AlertDescription>
          <p>
            {t('ifElsePreview.yourScore', { score })}
            {' · '}
            {t('ifElsePreview.threshold', { value: threshold })}
          </p>
          <p>
            {connected
              ? t('ifElsePreview.routesTo', { node: nextNodeLabel })
              : t('ifElsePreview.branchNotConnected')}
          </p>
        </AlertDescription>
      </Alert>
      <Separator />
    </div>
  )
}
