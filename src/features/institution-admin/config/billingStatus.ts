import type { VariantProps } from 'class-variance-authority'
import { badgeVariants } from '@/components/ui/badge-variants'
import type { BillingStatus } from '../types/licensing.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export const BILLING_STATUS_VARIANT: Partial<Record<BillingStatus, BadgeVariant>> = {
  active: 'green',
  trialing: 'blue',
  past_due: 'orange',
  grace: 'warning',
  suspended: 'destructive',
  expired: 'secondary',
  cancelled: 'secondary',
}
