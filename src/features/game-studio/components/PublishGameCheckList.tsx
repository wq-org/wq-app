'use client'

import { Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ValidationResult } from '../utils/publishValidation'
import { getDisplayNameForNodeType } from '../utils/publishValidation'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export interface PublishGameCheckListProps {
  validationResult: ValidationResult
}

export function PublishGameCheckList({ validationResult }: PublishGameCheckListProps) {
  const { t } = useTranslation('features.gameStudio')
  const { nodeItems, globalErrors } = validationResult
  const hasAnyErrors = globalErrors.length > 0 || nodeItems.some((item) => item.errors.length > 0)
  const title = hasAnyErrors
    ? t('publishChecklist.requirementsNotMet')
    : t('publishChecklist.requirementsMet')

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasAnyErrors ? (
            <X className="size-4 shrink-0 text-red-500" />
          ) : (
            <Check className="size-4 shrink-0" />
          )}
          <Text
            as="span"
            variant="body"
            className="font-semibold text-foreground"
          >
            {title}
          </Text>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <Text
            as="p"
            variant="small"
            className="mb-1 font-semibold text-foreground"
          >
            {t('publishChecklist.rulesTitle')}
          </Text>
          <Text
            as="div"
            variant="small"
            className="text-muted-foreground"
          >
            <ul className="list-disc list-inside space-y-0.5">
              <li>{t('publishChecklist.rules.noAbandoned')}</li>
              <li>{t('publishChecklist.rules.linkedStartToEnd')}</li>
              <li>{t('publishChecklist.rules.connectedPath')}</li>
              <li>{t('publishChecklist.rules.minimallyFilled')}</li>
            </ul>
          </Text>
        </div>
        <Separator />
        <div className="space-y-1">
          {globalErrors.map((msg, i) => (
            <div
              key={`global-${i}`}
              className="flex flex-wrap items-center gap-2"
            >
              <X className="size-4 shrink-0 text-red-500" />
              <Text
                as="span"
                variant="small"
                className="text-foreground"
              >
                {msg}
              </Text>
            </div>
          ))}
          {nodeItems.map((item) => {
            const displayName = getDisplayNameForNodeType(item.node.type)
            if (item.errors.length === 0) return null
            return item.errors.map((err, i) => (
              <div
                key={`${item.node.id}-${i}`}
                className="flex flex-wrap items-center gap-2"
              >
                <Badge
                  variant="secondary"
                  className="text-foreground"
                >
                  {displayName}
                </Badge>
                <Separator
                  orientation="vertical"
                  className="h-4 bg-border"
                />
                <X className="size-4 shrink-0 text-red-500" />
                <Text
                  as="span"
                  variant="small"
                  className="text-foreground"
                >
                  {err}
                </Text>
              </div>
            ))
          })}
        </div>
      </CardContent>
    </Card>
  )
}
