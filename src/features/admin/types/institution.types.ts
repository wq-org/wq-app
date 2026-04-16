export type InstitutionType =
  | 'school'
  | 'university'
  | 'college'
  | 'organization'
  | 'hospital'
  | 'other'
export type InstitutionStatus = 'active' | 'inactive' | 'suspended' | 'pending'
export type InvoiceLanguage = 'de' | 'en'

export type AddressJsonb = {
  street?: string
  addressLine2?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export type SocialLinks = {
  linkedin?: string
  instagram?: string
}

export type NewInstitutionWizardValues = {
  name: string
  slug: string
  type: InstitutionType | ''
  adminEmail: string
  legalName: string
  billingEmail: string
  street: string
  streetNumber: string
  postalCode: string
  city: string
  country: string
  createInitialStructure: boolean
  facultyName: string
  programmeName: string
}

export type BootstrapInstitutionFromWizardResult = {
  institution: Institution
  inviteToken: string
}

export type InstitutionFormData = {
  name: string
  slug: string
  type: InstitutionType | ''
  status: InstitutionStatus
  description: string
  email: string
  website: string
  phone: string
  legalName: string
  legalForm: string
  registrationNumber: string
  taxId: string
  vatId: string
  billingEmail: string
  billingContactName: string
  billingContactPhone: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  primaryContactRole: string
  invoiceLanguage: InvoiceLanguage
  paymentTerms: number
  address: AddressJsonb
  institutionNumber: string
  numberOfBeds?: number
  departments: string[]
  accreditation: string
  socialLinks: SocialLinks
  imageUrl: string
}

// Row — mirrors the DB schema exactly
export type InstitutionRow = {
  id: string
  name: string
  slug: string | null
  type: string | null
  status: string | null
  email: string | null
  description: string | null
  image_url: string | null
  created_at: string
}

// Model — what the UI actually uses
export type Institution = {
  id: string
  name: string
  slug: string | null
  type: string | null
  status: InstitutionStatus | null
  email: string | null
  description: string | null
  imageUrl: string | null
  createdAt: Date
}

export type InstitutionUpdateValues = {
  name: string
  type: InstitutionType | ''
  status: InstitutionStatus
  email: string
  description: string
}

export type InstitutionEditFormValues = {
  name: string
  type: InstitutionType | ''
  email: string
  description: string
  phone: string
  website: string
  legalName: string
  legalForm: string
  registrationNumber: string
  taxId: string
  vatId: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  primaryContactRole: string
  billingEmail: string
  billingContactName: string
  billingContactPhone: string
  invoiceLanguage: InvoiceLanguage
  paymentTerms: number
}

export function createFormValuesFromInstitution(
  institution: Institution,
): InstitutionEditFormValues {
  return {
    name: institution.name,
    type: (institution.type as InstitutionType | null) ?? '',
    email: institution.email ?? '',
    description: institution.description ?? '',
    phone: '',
    website: '',
    legalName: '',
    legalForm: '',
    registrationNumber: '',
    taxId: '',
    vatId: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    primaryContactRole: '',
    billingEmail: '',
    billingContactName: '',
    billingContactPhone: '',
    invoiceLanguage: 'de',
    paymentTerms: 30,
  }
}
