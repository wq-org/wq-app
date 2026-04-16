import type {
  InstitutionStatus,
  InstitutionType,
  InvoiceLanguage,
} from '../types/institution.types'

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
