'use client'

import { useTranslation } from 'react-i18next'

import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import type { GameIfElseCorrectPath } from './game-if-else.schema'

export type IfElseBranchDividerProps = {
  score: number
  threshold: number
  branch: GameIfElseCorrectPath
}

export function IfElseBranchDivider({ score, threshold, branch }: IfElseBranchDividerProps) {
  const { t } = useTranslation('features.gameStudio')

  const branchLabel =
    branch === 'A' ? t('ifElsePreview.branchResultA') : t('ifElsePreview.branchResultB')

  return (
    <div className="flex flex-col gap-3 py-2">
      <Separator />
      <div className="flex flex-col gap-1 rounded-xl bg-muted/30 px-4 py-3">
        <Text
          as="p"
          variant="small"
          muted
          bold
        >
          {t('ifElsePreview.title')}
        </Text>
        <Text
          as="p"
          variant="small"
        >
          {t('ifElsePreview.yourScore', { score })}
          {' · '}
          {t('ifElsePreview.threshold', { value: threshold })}
        </Text>
        <Text
          as="p"
          variant="small"
          className="text-foreground"
        >
          {branchLabel}
        </Text>
      </div>
      <Separator />
    </div>
  )
}
