export type InstitutionType = 'school' | 'university' | 'college' | 'organization' | 'other'
export type InstitutionStatus = 'active' | 'inactive' | 'suspended' | 'pending'

export interface AddressJsonb {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

interface SocialLinks {
  linkedin?: string
  instagram?: string
}

export interface InstitutionFormData {
  name: string
  slug: string
  type: InstitutionType | ''
  status: InstitutionStatus
  description: string
  email: string
  website: string
  address: AddressJsonb
  socialLinks: SocialLinks
  imageUrl: string
  imageFile?: File | null
}
