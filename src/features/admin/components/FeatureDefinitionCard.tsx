import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { formatRelativeUpdatedTime } from '@/features/lesson'
import { cn } from '@/lib/utils'

import type { FeatureDefinition } from '../types/featureDefinitions.types'

const ICON_RING = 'border border-blue-500/20 bg-blue-500/10 text-blue-500'
/** Fixed width for 3-up grid on large screens; `max-w-full` caps width in narrow layouts. */
const CARD_WIDTH = 'w-[250px] max-w-full shrink-0'

export type FeatureDefinitionCardProps = {
  feature: FeatureDefinition
  icon: LucideIcon
  onEdit: (featureId: string) => void
}

export function FeatureDefinitionCard({ feature, icon: Icon, onEdit }: FeatureDefinitionCardProps) {
  const { t, i18n } = useTranslation('features.admin')
  const isBoolean = feature.valueType === 'boolean'

  const updatedText = formatRelativeUpdatedTime(feature.updatedAt, undefined, i18n.language, {
    updatedRecently: t('featureDefinitions.card.updatedRecently'),
    updatedWithRelative: (relativeValue) =>
      t('featureDefinitions.card.updatedRelative', { relative: relativeValue }),
  })

  const categoryRaw = feature.category?.trim() ?? ''
  const categoryLabel = categoryRaw || t('featureDefinitions.card.noCategory')
  const isCoreCategory = categoryRaw.toLowerCase() === 'core'
  const displayName = feature.name?.trim() || feature.key

  return (
    <Card className={cn(CARD_WIDTH, 'gap-0 pt-4 pb-2.5 shadow-sm')}>
      <CardHeader className="gap-2 space-y-0 px-3 pb-1.5 pt-0.5">
        <div className="flex items-start gap-2">
          <div
            className={cn('flex size-8 shrink-0 items-center justify-center rounded-md', ICON_RING)}
            aria-hidden
          >
            <Icon className="size-3.5" />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <CardTitle className="truncate text-sm font-semibold leading-tight">
              {displayName}
            </CardTitle>

            <div className="flex flex-wrap gap-1">
              <Badge
                variant="secondary"
                className="max-w-full font-normal"
              >
                {isCoreCategory ? t('featureDefinitions.card.coreBadge') : categoryLabel}
              </Badge>
              {isBoolean ? (
                <Badge
                  variant="secondary"
                  className="max-w-full font-normal"
                >
                  {feature.defaultEnabled
                    ? t('featureDefinitions.card.defaultOn')
                    : t('featureDefinitions.card.defaultOff')}
                </Badge>
              ) : null}
            </div>

            <span className="block text-[11px] font-normal leading-tight text-muted-foreground">
              {updatedText}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="mt-auto border-0 px-3 pb-0 pt-1.5">
        <div className="flex w-full justify-end">
          <Button
            type="button"
            variant="darkblue"
            size="sm"
            onClick={() => onEdit(feature.id)}
          >
            <Text
              as="span"
              size="xs"
            >
              {t('featureDefinitions.card.edit')}
            </Text>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
