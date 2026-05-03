import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { useBillingPlans, type BillingPlanOption } from './useBillingPlans'

export type SubscriptionPlanPopoverProps = {
  currentPlanId: string | null
  currentPlanLabel: string
  disabled?: boolean
  onSelectPlan?: (plan: BillingPlanOption) => Promise<void> | void
  className?: string
}

function formatPlanLabel(plan: BillingPlanOption) {
  return `${plan.name} (${plan.code})`
}

export function SubscriptionPlanPopover({
  currentPlanId,
  currentPlanLabel,
  disabled = false,
  onSelectPlan,
  className,
}: SubscriptionPlanPopoverProps) {
  const { t } = useTranslation('features.institution')
  const { plans, isLoading, error } = useBillingPlans()
  const [open, setOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSubmittingPlanId, setIsSubmittingPlanId] = useState<string | null>(null)

  const triggerLabel = useMemo(
    () => currentPlanLabel || t('subscription.planPopover.assignPlan'),
    [currentPlanLabel, t],
  )

  const canAssign = Boolean(onSelectPlan) && !disabled

  const handleSelectPlan = async (plan: BillingPlanOption) => {
    if (!onSelectPlan || disabled) return
    setActionError(null)
    setIsSubmittingPlanId(plan.id)
    try {
      await onSelectPlan(plan)
      setOpen(false)
    } catch (selectError) {
      setActionError(
        selectError instanceof Error ? selectError.message : t('subscription.planPopover.error'),
      )
    } finally {
      setIsSubmittingPlanId(null)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled || !canAssign) {
          setOpen(false)
          return
        }
        setOpen(nextOpen)
        if (!nextOpen) {
          setActionError(null)
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('h-10 min-w-48 justify-between gap-3 font-normal', className)}
          disabled={disabled || !canAssign}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(30rem,calc(100vw-2rem))] p-2"
      >
        <div className="flex flex-col gap-2">
          <div className="px-2 pt-1">
            <Text
              as="p"
              variant="small"
              className="font-semibold"
            >
              {t('subscription.planPopover.title')}
            </Text>
            <Text
              as="p"
              variant="small"
              color="muted"
            >
              {t('subscription.planPopover.subtitle')}
            </Text>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 px-2 py-4">
              <Spinner
                variant="gray"
                size="sm"
                speed={1750}
              />
              <Text
                as="span"
                variant="small"
                color="muted"
              >
                {t('subscription.planPopover.loading')}
              </Text>
            </div>
          ) : error ? (
            <Text
              as="p"
              variant="small"
              color="danger"
              className="px-2 py-3"
            >
              {t('subscription.planPopover.loadError')}: {error}
            </Text>
          ) : plans.length === 0 ? (
            <Text
              as="p"
              variant="small"
              color="muted"
              className="px-2 py-3"
            >
              {t('subscription.planPopover.empty')}
            </Text>
          ) : (
            <ScrollArea className="h-64">
              <div className="grid gap-1">
                {plans.map((plan) => {
                  const selected = plan.id === currentPlanId
                  return (
                    <Button
                      key={plan.id}
                      type="button"
                      variant={selected ? 'darkblue' : 'ghost'}
                      className="h-auto justify-start px-3 py-2 text-left"
                      disabled={disabled || isSubmittingPlanId !== null}
                      onClick={() => void handleSelectPlan(plan)}
                    >
                      <div className="flex w-full items-start justify-between gap-3">
                        <div className="min-w-0 text-left">
                          <Text
                            as="p"
                            variant="small"
                            className="font-medium"
                          >
                            {formatPlanLabel(plan)}
                          </Text>
                          {plan.description ? (
                            <Text
                              as="p"
                              variant="small"
                              color="muted"
                              className="mt-1 line-clamp-2"
                            >
                              {plan.description}
                            </Text>
                          ) : null}
                        </div>
                        <Badge
                          variant={selected ? 'blue' : 'secondary'}
                          size="sm"
                        >
                          {selected ? t('subscription.planPopover.current') : plan.code}
                        </Badge>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {actionError ? (
            <Text
              as="p"
              variant="small"
              color="danger"
              className="px-2 pb-1 pt-2"
            >
              {actionError}
            </Text>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
