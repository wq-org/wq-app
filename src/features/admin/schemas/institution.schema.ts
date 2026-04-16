import { z } from 'zod'

export const wizardIdentitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  type: z
    .string()
    .refine(
      (v) => ['school', 'university', 'college', 'organization', 'hospital', 'other'].includes(v),
      { message: 'Select a type' },
    ),
  adminEmail: z.email({ error: 'Invalid email address' }),
})

export const wizardBillingSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  billingEmail: z.email({ error: 'Invalid email address' }),
  street: z.string(),
  streetNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string().min(1, 'Country is required'),
})

export const wizardStructureSchema = z.object({
  createInitialStructure: z.boolean(),
  facultyName: z.string(),
  programmeName: z.string(),
})

export const newInstitutionWizardSchema = wizardIdentitySchema
  .extend(wizardBillingSchema.shape)
  .extend(wizardStructureSchema.shape)

export type NewInstitutionWizardFormValues = z.infer<typeof newInstitutionWizardSchema>

const optionalEmail = z.union([z.email({ error: 'Invalid email' }), z.literal('')])
const optionalUrl = z.union([z.url({ error: 'Invalid URL' }), z.literal('')])

export const institutionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  type: z.string(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  description: z.string().min(1, 'Description is required'),
  email: optionalEmail,
  website: optionalUrl,
  phone: z.string().min(1, 'Phone is required'),
  legalName: z.string().min(1, 'Legal name is required'),
  legalForm: z.string().min(1, 'Legal form is required'),
  registrationNumber: z.string(),
  taxId: z.string(),
  vatId: z.string().min(1, 'VAT ID is required'),
  billingEmail: optionalEmail,
  billingContactName: z.string(),
  billingContactPhone: z.string(),
  primaryContactName: z.string().min(1, 'Primary contact name is required'),
  primaryContactEmail: optionalEmail,
  primaryContactPhone: z.string(),
  primaryContactRole: z.string(),
  invoiceLanguage: z.enum(['de', 'en']),
  paymentTerms: z.number({ error: 'Must be a number' }).int().min(0),
  address: z.object({
    street: z.string(),
    addressLine2: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }),
  institutionNumber: z.string(),
  numberOfBeds: z.preprocess(
    (v) =>
      v === '' || v === undefined || (typeof v === 'number' && Number.isNaN(v))
        ? undefined
        : Number(v),
    z.number().int().positive().optional(),
  ),
  departments: z.string(),
  accreditation: z.string(),
  socialLinks: z.object({
    linkedin: z.string().min(1, 'LinkedIn is required'),
    instagram: z.string().min(1, 'Instagram is required'),
  }),
  imageUrl: z.string(),
})

export type InstitutionFormValues = z.infer<typeof institutionSchema>
