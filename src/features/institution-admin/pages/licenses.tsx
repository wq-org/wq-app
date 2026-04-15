import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '@/components/ui/badge-variants'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  CompactSettingsTableSwitches,
  type SwitchItem,
} from '@/components/shared/CompactSettingsTableSwitches'
import { StatusSummaryCard, type StatusSummaryRow } from '@/components/shared'
import type { BillingStatus } from '../api/institutionSubscriptionApi'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useInstitutionLicensing } from '../hooks/useInstitutionLicensing'
import type {
  EffectiveFeature,
  EffectiveFeatureGroup,
  EffectiveFeatureSource,
} from '../types/licensing.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const BILLING_STATUS_VARIANT: Partial<Record<BillingStatus, BadgeVariant>> = {
  active: 'green',
  trialing: 'blue',
  past_due: 'orange',
  grace: 'warning',
  suspended: 'destructive',
  expired: 'secondary',
  cancelled: 'secondary',
}

const SOURCE_VARIANT: Record<EffectiveFeatureSource, BadgeVariant> = {
  override: 'violet',
  plan: 'blue',
  default: 'secondary',
}

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d)
}

function groupByCategory(features: EffectiveFeature[]): EffectiveFeatureGroup[] {
  const groups = new Map<string, EffectiveFeature[]>()
  for (const f of features) {
    const list = groups.get(f.category) ?? []
    list.push(f)
    groups.set(f.category, list)
  }
  return [...groups.entries()].map(([category, list]) => ({ category, features: list }))
}

function renderFeatureValue(feature: EffectiveFeature): string {
  switch (feature.valueType) {
    case 'integer':
      return feature.integerValue != null ? String(feature.integerValue) : '—'
    case 'bigint':
      return feature.bigintValue ?? '—'
    case 'text':
      return feature.textValue ?? '—'
    default:
      return ''
  }
}

const AdminLicenses = () => {
  const { t, i18n } = useTranslation('features.institution-admin')
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US'
  const { subscription, planCode, features, isLoading, error } = useInstitutionLicensing()

  const planLabel = subscription?.plan_catalog
    ? `${subscription.plan_catalog.name} (${subscription.plan_catalog.code})`
    : (planCode ?? '—')

  const billingVariant: BadgeVariant = subscription
    ? (BILLING_STATUS_VARIANT[subscription.billing_status] ?? 'secondary')
    : 'secondary'

  const statusRows: StatusSummaryRow[] = useMemo(() => {
    if (!subscription) return []
    return [
      { label: t('licenses.summary.plan'), value: planLabel },
      {
        label: t('licenses.summary.billingStatus'),
        value: (
          <Badge variant={billingVariant}>
            {t(`subscription.billingStatuses.${subscription.billing_status}`, {
              ns: 'features.institution',
              defaultValue: subscription.billing_status,
            })}
          </Badge>
        ),
      },
      {
        label: t('licenses.summary.effectiveFrom'),
        value: formatDate(subscription.effective_from, locale),
      },
      {
        label: t('licenses.summary.renewalAt'),
        value: formatDate(subscription.renewal_at, locale),
      },
    ]
  }, [subscription, planLabel, billingVariant, locale, t])

  const groups = useMemo(() => groupByCategory(features), [features])

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-6">
        <div>
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-bold"
          >
            {t('licenses.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('licenses.subtitle')}
          </Text>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : error ? (
          <Text
            as="p"
            variant="small"
            color="danger"
          >
            {t('licenses.loadError')}: {error}
          </Text>
        ) : !subscription ? (
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('licenses.empty')}
          </Text>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] items-start">
            <StatusSummaryCard
              title={subscription.plan_catalog?.name ?? planCode ?? '—'}
              description={subscription.plan_catalog?.code ?? undefined}
              icon={ShieldCheck}
              iconAccent="blue"
              rows={statusRows}
            />

            <div className="rounded-xl border border-border bg-card">
              {groups.length === 0 ? (
                <Text
                  as="p"
                  variant="small"
                  color="muted"
                  className="px-5 py-4"
                >
                  {t('licenses.noFeatures')}
                </Text>
              ) : (
                groups.map((group, groupIndex) => {
                  const boolFeatures = group.features.filter((f) => f.valueType === 'boolean')
                  const otherFeatures = group.features.filter((f) => f.valueType !== 'boolean')

                  const switchItems: SwitchItem[] = boolFeatures.map((f) => ({
                    id: f.featureId,
                    label: f.name,
                    description: f.description || undefined,
                    checked: f.booleanValue ?? f.defaultEnabled,
                  }))

                  return (
                    <Collapsible
                      key={group.category}
                      defaultOpen
                    >
                      {groupIndex > 0 && <Separator />}
                      <CollapsibleTrigger className="group flex w-full items-center justify-between px-5 py-4 text-sm font-semibold hover:text-foreground">
                        {t(`featureDefinitions.categories.${group.category}`, {
                          ns: 'features.admin',
                          defaultValue: group.category,
                        })}
                        <ChevronDown
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                        />
                      </CollapsibleTrigger>
                      <Separator />
                      <CollapsibleContent className="px-5 pb-4 pt-1">
                        {switchItems.length > 0 && (
                          <div className="space-y-2">
                            <CompactSettingsTableSwitches
                              items={switchItems}
                              disabled
                              onCheckedChange={() => undefined}
                            />
                            {boolFeatures.some((f) => f.source !== 'default') && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {boolFeatures.map((f) =>
                                  f.source === 'default' ? null : (
                                    <Badge
                                      key={f.featureId}
                                      variant={SOURCE_VARIANT[f.source]}
                                      size="sm"
                                    >
                                      {f.name}: {t(`licenses.source.${f.source}`)}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {otherFeatures.map((feature) => (
                          <div
                            key={feature.featureId}
                            className="flex items-start justify-between gap-3 border-b py-3 last:border-b-0"
                          >
                            <div className="min-w-0">
                              <Text
                                as="p"
                                variant="small"
                                className="font-semibold text-foreground"
                              >
                                {feature.name}
                              </Text>
                              {feature.description ? (
                                <Text
                                  as="p"
                                  variant="small"
                                  color="muted"
                                  className="mt-1 text-xs"
                                >
                                  {feature.description}
                                </Text>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <Text
                                as="span"
                                variant="small"
                                className="font-medium tabular-nums"
                              >
                                {renderFeatureValue(feature)}
                              </Text>
                              <Badge
                                variant={SOURCE_VARIANT[feature.source]}
                                size="sm"
                              >
                                {t(`licenses.source.${feature.source}`)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { AdminLicenses }
