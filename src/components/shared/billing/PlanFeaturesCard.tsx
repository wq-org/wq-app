import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Minus } from 'lucide-react'

import { getFeatureDefinitionIcon } from '@/features/admin'
import type { EffectiveFeature } from '@/features/institution-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

function groupByCategory(features: EffectiveFeature[]) {
  const groups = new Map<string, EffectiveFeature[]>()
  for (const f of features) {
    const list = groups.get(f.category) ?? []
    list.push(f)
    groups.set(f.category, list)
  }
  return [...groups.entries()].map(([category, list]) => ({ category, features: list }))
}

function formatFeatureValue(feature: EffectiveFeature): string {
  switch (feature.valueType) {
    case 'boolean':
      return (feature.booleanValue ?? feature.defaultEnabled) ? 'Enabled' : 'Disabled'
    case 'integer':
      return feature.integerValue != null ? feature.integerValue.toLocaleString() : '—'
    case 'bigint': {
      const value = feature.bigintValue ? BigInt(feature.bigintValue) : null
      if (!value) return '—'
      if (
        (feature.key.toLowerCase().includes('storage') ||
          feature.key.toLowerCase().includes('bytes')) &&
        value >= 1073741824n
      ) {
        const gb = Number(value) / 1073741824
        return `${gb.toFixed(1)} GB`
      }
      return value.toLocaleString()
    }
    case 'text':
      return feature.textValue ?? '—'
    default:
      return '—'
  }
}

export type PlanFeaturesCardProps = {
  features: EffectiveFeature[]
  planCode: string | null
  isLoading: boolean
  error: string | null
}

export function PlanFeaturesCard({ features, planCode, isLoading, error }: PlanFeaturesCardProps) {
  const { t } = useTranslation('features.institution-admin')
  const groups = useMemo(() => groupByCategory(features), [features])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-60 items-center justify-center">
          <Spinner
            variant="gray"
            size="sm"
            speed={1750}
          />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Text
            as="p"
            variant="small"
            color="danger"
            className="py-6"
          >
            {t('licenses.loadError')}: {error}
          </Text>
        </CardContent>
      </Card>
    )
  }

  if (features.length === 0) {
    return (
      <Card>
        <CardContent>
          <Text
            as="p"
            variant="small"
            color="muted"
            className="py-6"
          >
            {t('licenses.noFeatures')}
          </Text>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between gap-2">
          <span>{t('planFeatures.title')}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {planCode ?? '—'} · {t('planFeatures.featureCount', { count: features.length })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {groups.map((group, groupIndex) => (
          <div key={group.category}>
            {groupIndex > 0 && <Separator className="my-0" />}
            <div className="space-y-3 py-4 first:pt-0 last:pb-0">
              <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(`featureDefinitions.categories.${group.category}`, {
                  ns: 'features.admin',
                  defaultValue: group.category,
                })}
              </div>
              <div className="space-y-2">
                {group.features.map((feature) => {
                  const Icon = getFeatureDefinitionIcon(feature.key)
                  const isEnabled =
                    feature.valueType === 'boolean'
                      ? (feature.booleanValue ?? feature.defaultEnabled)
                      : true

                  return (
                    <div
                      key={feature.featureId}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Icon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <Text
                            as="p"
                            variant="small"
                            className="font-medium text-foreground"
                          >
                            {feature.name}
                          </Text>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {feature.valueType === 'boolean' ? (
                          isEnabled ? (
                            <Check
                              className="size-4 text-foreground"
                              aria-label={t('planFeatures.enabled')}
                            />
                          ) : (
                            <Minus
                              className="size-4 text-muted-foreground"
                              aria-label={t('planFeatures.disabled')}
                            />
                          )
                        ) : (
                          <Text
                            as="span"
                            variant="small"
                            className="font-medium tabular-nums"
                          >
                            {formatFeatureValue(feature)}
                          </Text>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
