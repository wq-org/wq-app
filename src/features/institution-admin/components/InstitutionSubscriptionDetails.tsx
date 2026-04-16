import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'

import {
  fetchLatestInstitutionSubscription,
  resolvePlanCode,
  type InstitutionSubscriptionWithPlan,
} from '../api/institutionSubscriptionApi'
import { BILLING_STATUS_VARIANT } from '../config/billingStatus'

function formatDateTime(iso: string | null | undefined, locale: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
      <Text
        as="span"
        variant="small"
        color="muted"
        className="shrink-0 sm:min-w-[180px]"
      >
        {label}
      </Text>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function SubscriptionBody({
  sub,
  resolvedPlanCode,
  locale,
  t,
}: {
  sub: InstitutionSubscriptionWithPlan
  resolvedPlanCode: string | null
  locale: string
  t: (key: string) => string
}) {
  const planLabel = sub.plan_catalog
    ? `${sub.plan_catalog.name} (${sub.plan_catalog.code})`
    : (resolvedPlanCode ?? '—')

  const billingVariant = BILLING_STATUS_VARIANT[sub.billing_status] ?? 'secondary'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Text
          as="h3"
          variant="h3"
          className="text-base font-semibold"
        >
          {t('subscription.sectionPlan')}
        </Text>
        <DetailRow label={t('subscription.plan')}>
          <Text
            as="p"
            variant="body"
          >
            {planLabel}
          </Text>
        </DetailRow>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Text
          as="h3"
          variant="h3"
          className="text-base font-semibold"
        >
          {t('subscription.sectionTerm')}
        </Text>
        <DetailRow label={t('subscription.effectiveFrom')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub.effective_from, locale)}
          </Text>
        </DetailRow>
        <DetailRow label={t('subscription.effectiveTo')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub.effective_to, locale)}
          </Text>
        </DetailRow>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Text
          as="h3"
          variant="h3"
          className="text-base font-semibold"
        >
          {t('subscription.sectionBilling')}
        </Text>
        <DetailRow label={t('subscription.billingStatus')}>
          <Badge variant={billingVariant}>
            {t(`subscription.billingStatuses.${sub.billing_status}`)}
          </Badge>
        </DetailRow>
        <DetailRow label={t('subscription.renewalAt')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub.renewal_at, locale)}
          </Text>
        </DetailRow>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Text
          as="h3"
          variant="h3"
          className="text-base font-semibold"
        >
          {t('subscription.sectionPeriod')}
        </Text>
        <DetailRow label={t('subscription.currentPeriodStart')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub.current_period_start, locale)}
          </Text>
        </DetailRow>
        <DetailRow label={t('subscription.currentPeriodEnd')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub.current_period_end, locale)}
          </Text>
        </DetailRow>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Text
          as="h3"
          variant="h3"
          className="text-base font-semibold"
        >
          {t('subscription.sectionCancellation')}
        </Text>
        <DetailRow label={t('subscription.cancelAtPeriodEnd')}>
          <Text
            as="p"
            variant="body"
          >
            {sub.cancel_at_period_end ? t('subscription.yes') : t('subscription.no')}
          </Text>
        </DetailRow>
        <DetailRow label={t('subscription.canceledAt')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub.canceled_at, locale)}
          </Text>
        </DetailRow>
        <DetailRow label={t('subscription.trialEndsAt')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub.trial_ends_at, locale)}
          </Text>
        </DetailRow>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <Text
          as="h3"
          variant="h3"
          className="text-base font-semibold"
        >
          {t('subscription.sectionRecord')}
        </Text>
        <DetailRow label={t('subscription.updatedAt')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub.updated_at, locale)}
          </Text>
        </DetailRow>
      </div>
    </div>
  )
}

type InstitutionSubscriptionDetailsProps =
  | { institutionId: string; subscription?: undefined }
  | { institutionId?: undefined; subscription: InstitutionSubscriptionWithPlan | null }

export function InstitutionSubscriptionDetails({
  institutionId,
  subscription: propSubscription,
}: InstitutionSubscriptionDetailsProps) {
  const { t, i18n } = useTranslation('features.institution')
  const isPropControlled = propSubscription !== undefined

  const [sub, setSub] = useState<InstitutionSubscriptionWithPlan | null | undefined>(
    isPropControlled ? propSubscription : undefined,
  )
  const [resolvedPlanCode, setResolvedPlanCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isPropControlled) {
      setSub(propSubscription)
      return
    }
    if (!institutionId) return
    let cancelled = false
    setSub(undefined)
    setResolvedPlanCode(null)
    setError(null)
    fetchLatestInstitutionSubscription(institutionId)
      .then(async (row) => {
        if (cancelled) return
        setSub(row)
        if (row && !row.plan_catalog) {
          const code = await resolvePlanCode(row.plan_id)
          if (!cancelled) setResolvedPlanCode(code)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setSub(null)
          setError(e.message)
        }
      })
    return () => {
      cancelled = true
    }
  }, [institutionId, isPropControlled, propSubscription])

  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US'

  if (sub === undefined) {
    return (
      <div
        className="rounded-2xl border bg-card p-6 flex items-center gap-2"
        aria-busy="true"
      >
        <Spinner
          variant="gray"
          size="sm"
        />
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {t('subscription.loading')}
        </Text>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-card p-6">
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('subscription.loadError')}
        </Text>
      </div>
    )
  }

  if (!sub) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('subscription.empty')}
        </Text>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <Text
        as="h2"
        variant="h2"
        className="text-lg font-semibold mb-4"
      >
        {t('subscription.title')}
      </Text>
      <SubscriptionBody
        sub={sub}
        resolvedPlanCode={resolvedPlanCode}
        locale={locale}
        t={t}
      />
    </div>
  )
}
