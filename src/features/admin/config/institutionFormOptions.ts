import type { VariantProps } from 'class-variance-authority'

import { badgeVariants } from '@/components/ui/badge-variants'

import type {
  InstitutionStatus,
  InstitutionType,
  InvoiceLanguage,
} from '../types/institution.types'

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export const STATUS_VARIANT: Record<InstitutionStatus, BadgeVariant> = {
  active: 'outline',
  pending: 'blue',
  inactive: 'secondary',
  suspended: 'destructive',
}

export const INSTITUTION_TYPE_OPTIONS = [
  'school',
  'university',
  'college',
  'organization',
  'hospital',
  'other',
] as const satisfies readonly InstitutionType[]

export const INSTITUTION_STATUS_VALUES: InstitutionStatus[] = [
  'active',
  'inactive',
  'suspended',
  'pending',
]

export const LEGAL_FORM_VALUES = ['gmbh', 'ggmbh', 'ag', 'ev', 'kg', 'other'] as const

export const INVOICE_LANGUAGE_VALUES: InvoiceLanguage[] = ['de', 'en'] as const
