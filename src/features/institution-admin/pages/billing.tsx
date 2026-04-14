import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { InvoiceList, type InvoiceListItem } from '@/components/shared'
import { useUser } from '@/contexts/user'
import { InstitutionSubscriptionDetails } from '@/features/institution/components/InstitutionSubscriptionDetails'
import { getFeatureDefinitionIcon } from '@/features/admin/config/featureDefinitionIcons'
import type {
  EffectiveFeature,
  EffectiveFeatureGroup,
  EffectiveFeatureSource,
} from '../types/licensing.types'
import { useInstitutionLicensing } from '../hooks/useInstitutionLicensing'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

type BadgeVariant = 'violet' | 'blue' | 'secondary'

const SOURCE_VARIANT: Record<EffectiveFeatureSource, BadgeVariant> = {
  override: 'violet',
  plan: 'blue',
  default: 'secondary',
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

function formatFeatureValue(feature: EffectiveFeature): string {
  switch (feature.valueType) {
    case 'boolean':
      return (feature.booleanValue ?? feature.defaultEnabled) ? 'Enabled' : 'Disabled'
    case 'integer':
      return feature.integerValue != null ? feature.integerValue.toLocaleString() : '—'
    case 'bigint': {
      const value = feature.bigintValue ? BigInt(feature.bigintValue) : null
      if (!value) return '—'
      // Check if key contains 'storage' or 'bytes' and value is >= 1GB
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

function PlanFeaturesCard({
  features,
  planCode,
  isLoading,
  error,
}: {
  features: EffectiveFeature[]
  planCode: string | null
  isLoading: boolean
  error: string | null
}) {
  const { t } = useTranslation('features.institution-admin')
  const groups = useMemo(() => groupByCategory(features), [features])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[240px] items-center justify-center">
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
        <CardTitle className="flex items-baseline justify-between">
          <span>What's included in your plan</span>
          <span className="text-sm font-normal text-muted-foreground">
            {planCode ?? '—'} · {features.length} features
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
                      <div className="flex items-center gap-3 min-w-0">
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
                          <Text
                            as="span"
                            variant="small"
                            className={`font-medium ${
                              isEnabled ? 'text-green-600' : 'text-muted-foreground'
                            }`}
                          >
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </Text>
                        ) : (
                          <Text
                            as="span"
                            variant="small"
                            className="font-medium tabular-nums"
                          >
                            {formatFeatureValue(feature)}
                          </Text>
                        )}
                        {feature.source !== 'default' && (
                          <Badge
                            variant={SOURCE_VARIANT[feature.source]}
                            size="xs"
                          >
                            {t(`licenses.source.${feature.source}`)}
                          </Badge>
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

const mockInvoices: InvoiceListItem[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2026-001',
    date: '2026-03-10',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2026-002',
    date: '2026-02-10',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2026-003',
    date: '2026-01-10',
    amount: 299,
    currency: 'USD',
    status: 'pending',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_004',
    invoiceNumber: 'INV-2025-012',
    date: '2025-12-10',
    amount: 299,
    currency: 'USD',
    status: 'failed',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_005',
    invoiceNumber: 'INV-2025-011',
    date: '2025-11-10',
    amount: 149,
    currency: 'USD',
    status: 'refunded',
    description: 'Plan adjustment credit',
  },
]

const AdminBilling = () => {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const { features, planCode, isLoading, error } = useInstitutionLicensing()
  const institutionId = getUserInstitutionId()

  const invoiceListLabels = {
    title: t('billing.invoices.title'),
    description: t('billing.invoices.description'),
    searchPlaceholder: t('billing.invoices.searchPlaceholder'),
    statusFilterPlaceholder: t('billing.invoices.statusFilterPlaceholder'),
    statuses: {
      paid: t('billing.invoices.status.paid'),
      pending: t('billing.invoices.status.pending'),
      failed: t('billing.invoices.status.failed'),
      refunded: t('billing.invoices.status.refunded'),
      void: t('billing.invoices.status.void'),
    },
    allStatuses: t('billing.invoices.status.all'),
    viewButton: t('billing.invoices.view'),
    emptyFiltered: t('billing.invoices.emptyFiltered'),
    emptyList: t('billing.invoices.empty'),
    pageLabel: t('billing.invoices.page'),
    previousButton: t('billing.invoices.previous'),
    nextButton: t('billing.invoices.next'),
    invoicesCount: (count: number) =>
      t('billing.invoices.count', {
        count,
      }),
  }

  const handleInvoiceDownload = (invoiceId: string) => {
    console.log('Download invoice:', invoiceId)
  }

  const handleInvoiceView = (invoiceId: string) => {
    console.log('View invoice details:', invoiceId)
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-6">
        <div>
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-bold"
          >
            {t('billing.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('billing.subtitle')}
          </Text>
        </div>

        {institutionId ? (
          <InstitutionSubscriptionDetails institutionId={institutionId} />
        ) : (
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('billing.noInstitution')}
          </Text>
        )}

        <InvoiceList
          invoices={mockInvoices}
          labels={invoiceListLabels}
          onDownloadInvoice={handleInvoiceDownload}
          onViewInvoice={handleInvoiceView}
        />

        <PlanFeaturesCard
          features={features}
          planCode={planCode}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { AdminBilling }
