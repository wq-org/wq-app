import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/badge-variants'
import type { BillingStatus } from '../types/licensing.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export const BILLING_STATUS_VARIANT = {
  active: 'green',
  trialing: 'blue',
  past_due: 'orange',
  grace: 'warning',
  suspended: 'destructive',
  expired: 'secondary',
  cancelled: 'secondary',
} as const satisfies Partial<Record<BillingStatus, BadgeVariant>>

export function getBillingStatusBadgeVariant(status: BillingStatus): BadgeVariant {
  return BILLING_STATUS_VARIANT[status] ?? 'secondary'
}

export function isTerminalBillingStatus(status: BillingStatus): boolean {
  return status === 'expired' || status === 'cancelled'
}
