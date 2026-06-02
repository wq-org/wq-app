import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'
import { SubscriptionPlanPopover } from '@/components/shared'

import {
  cancelInstitutionSubscriptionNow,
  fetchLatestInstitutionSubscription,
  resolvePlanCode,
} from '../api/institutionSubscriptionApi'
import { getBillingStatusBadgeVariant, isTerminalBillingStatus } from '../config/billingStatus'
import type { InstitutionSubscriptionWithPlan } from '../types/licensing.types'

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
  sub: InstitutionSubscriptionWithPlan | null
  resolvedPlanCode: string | null
  locale: string
  t: (key: string) => string
}) {
  const planLabel = sub?.plan_catalog
    ? `${sub.plan_catalog.name} (${sub.plan_catalog.code})`
    : sub
      ? (resolvedPlanCode ?? '—')
      : '—'

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
            {formatDateTime(sub?.effective_from, locale)}
          </Text>
        </DetailRow>
        <DetailRow label={t('subscription.effectiveTo')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub?.effective_to, locale)}
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
          {sub ? (
            <Badge variant={getBillingStatusBadgeVariant(sub.billing_status)}>
              {t(`subscription.billingStatuses.${sub.billing_status}`)}
            </Badge>
          ) : (
            <Text
              as="p"
              variant="body"
            >
              —
            </Text>
          )}
        </DetailRow>
        <DetailRow label={t('subscription.renewalAt')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub?.renewal_at, locale)}
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
            {formatDateTime(sub?.current_period_start, locale)}
          </Text>
        </DetailRow>
        <DetailRow label={t('subscription.currentPeriodEnd')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub?.current_period_end, locale)}
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
            {sub ? (sub.cancel_at_period_end ? t('subscription.yes') : t('subscription.no')) : '—'}
          </Text>
        </DetailRow>
        <DetailRow label={t('subscription.canceledAt')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub?.canceled_at, locale)}
          </Text>
        </DetailRow>
        <DetailRow label={t('subscription.trialEndsAt')}>
          <Text
            as="p"
            variant="body"
          >
            {formatDateTime(sub?.trial_ends_at, locale)}
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
            {formatDateTime(sub?.updated_at, locale)}
          </Text>
        </DetailRow>
      </div>
    </div>
  )
}

type PlanAssignment = {
  disabled?: boolean
  onSelectPlan?: (planId: string) => Promise<void> | void
}

type InstitutionSubscriptionDetailsProps =
  | {
      institutionId: string
      refreshToken?: number
      planAssignment?: PlanAssignment
      onSubscriptionCanceled?: () => void
      subscription?: undefined
    }
  | {
      institutionId?: undefined
      refreshToken?: number
      planAssignment?: PlanAssignment
      onSubscriptionCanceled?: () => void
      subscription: InstitutionSubscriptionWithPlan | null
    }

export function InstitutionSubscriptionDetails({
  institutionId,
  subscription: propSubscription,
  refreshToken = 0,
  planAssignment,
  onSubscriptionCanceled,
}: InstitutionSubscriptionDetailsProps) {
  const { t, i18n } = useTranslation('features.institution')
  const isPropControlled = propSubscription !== undefined

  const [sub, setSub] = useState<InstitutionSubscriptionWithPlan | null | undefined>(
    isPropControlled ? propSubscription : undefined,
  )
  const [resolvedPlanCode, setResolvedPlanCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const refetchLatest = useCallback(async () => {
    if (!institutionId) return
    const row = await fetchLatestInstitutionSubscription(institutionId)
    setSub(row)
    if (row && !row.plan_catalog) {
      const code = await resolvePlanCode(row.plan_id)
      setResolvedPlanCode(code)
    } else {
      setResolvedPlanCode(null)
    }
  }, [institutionId])

  const handleCancelSubscription = useCallback(async () => {
    if (!sub) return
    setIsCanceling(true)
    try {
      await cancelInstitutionSubscriptionNow(sub.id)
      toast.success(t('subscription.cancelSubscriptionSuccess'))
      setCancelDialogOpen(false)
      onSubscriptionCanceled?.()
      if (!isPropControlled && institutionId) {
        await refetchLatest()
      }
    } catch (e) {
      toast.error(t('subscription.cancelSubscriptionError'), {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setIsCanceling(false)
    }
  }, [sub, t, onSubscriptionCanceled, isPropControlled, institutionId, refetchLatest])

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
  }, [institutionId, isPropControlled, propSubscription, refreshToken])

  useEffect(() => {
    if (!sub || isTerminalBillingStatus(sub.billing_status)) {
      setCancelDialogOpen(false)
    }
  }, [sub])

  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US'
  const canAssignPlan = Boolean(planAssignment?.onSelectPlan) && !planAssignment?.disabled
  const currentPlanLabel = sub?.plan_catalog
    ? `${sub.plan_catalog.name} (${sub.plan_catalog.code})`
    : (resolvedPlanCode ?? '')

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

  const showCancelFooter = Boolean(sub && !isTerminalBillingStatus(sub.billing_status))

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <Text
          as="h2"
          variant="h2"
          className="text-lg font-semibold"
        >
          {t('subscription.title')}
        </Text>
        <SubscriptionPlanPopover
          currentPlanId={sub?.plan_id ?? null}
          currentPlanLabel={currentPlanLabel}
          disabled={!canAssignPlan}
          onSelectPlan={
            canAssignPlan
              ? async (plan) => {
                  await planAssignment?.onSelectPlan?.(plan.id)
                }
              : undefined
          }
        />
      </div>
      <SubscriptionBody
        sub={sub}
        resolvedPlanCode={resolvedPlanCode}
        locale={locale}
        t={t}
      />
      {showCancelFooter ? (
        <>
          <Separator className="my-4" />
          <div className="flex flex-col gap-3 border-t pt-4">
            <Button
              type="button"
              variant="delete"
              disabled={isCanceling}
              onClick={() => setCancelDialogOpen(true)}
            >
              {t('subscription.cancelSubscription')}
            </Button>
          </div>
          <Dialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('subscription.cancelSubscriptionDialogTitle')}</DialogTitle>
                <DialogDescription>
                  {t('subscription.cancelSubscriptionDialogDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCanceling}
                  onClick={() => setCancelDialogOpen(false)}
                >
                  {t('subscription.cancelSubscriptionDialogDismiss')}
                </Button>
                <Button
                  type="button"
                  variant="delete"
                  disabled={isCanceling}
                  onClick={() => void handleCancelSubscription()}
                >
                  {isCanceling
                    ? t('subscription.cancelSubscriptionDialogConfirming')
                    : t('subscription.cancelSubscriptionDialogConfirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  )
}
