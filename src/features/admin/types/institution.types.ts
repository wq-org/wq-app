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
  imageUrl: string | null
  createdAt: Date
}
