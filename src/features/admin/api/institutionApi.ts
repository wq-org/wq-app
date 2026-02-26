import { supabase } from '@/lib/supabase'
import type { InstitutionFormData } from '@/features/admin/types/institution.types'

function toOptionalText(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function toOptionalPositiveInteger(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/** Fetch all institutions ordered by creation date (newest first). */
export async function fetchInstitutions() {
  const { data, error } = await supabase
    .from('institutions')
    .select('id, name, slug, type, status, email, image_url, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching institutions:', error)
    throw error
  }

  return data
}

/**
 * Create a new institution in the database.
 * Maps form data to the institutions schema (address and social_links as JSONB).
 */
export async function createInstitution(data: InstitutionFormData) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const hasAddress = Object.values(data.address || {}).some((v) => (v ?? '').trim().length > 0)
  const hasSocialLinks =
    (data.socialLinks?.linkedin ?? '').trim().length > 0 ||
    (data.socialLinks?.instagram ?? '').trim().length > 0
  const normalizedDepartments = (data.departments ?? [])
    .map((department) => department.trim())
    .filter((department) => department.length > 0)

  const { data: institution, error } = await supabase
    .from('institutions')
    .insert({
      name: data.name.trim(),
      slug: toOptionalText(data.slug),
      type: data.type || null,
      status: data.status ?? 'active',
      description: toOptionalText(data.description),
      email: toOptionalText(data.email),
      website: toOptionalText(data.website),
      phone: toOptionalText(data.phone),
      legal_name: toOptionalText(data.legalName),
      legal_form: toOptionalText(data.legalForm),
      registration_number: toOptionalText(data.registrationNumber),
      tax_id: toOptionalText(data.taxId),
      vat_id: toOptionalText(data.vatId),
      billing_email: toOptionalText(data.billingEmail),
      billing_contact_name: toOptionalText(data.billingContactName),
      billing_contact_phone: toOptionalText(data.billingContactPhone),
      primary_contact_name: toOptionalText(data.primaryContactName),
      primary_contact_email: toOptionalText(data.primaryContactEmail),
      primary_contact_phone: toOptionalText(data.primaryContactPhone),
      primary_contact_role: toOptionalText(data.primaryContactRole),
      invoice_language: data.invoiceLanguage ?? 'de',
      payment_terms:
        typeof data.paymentTerms === 'number' && Number.isFinite(data.paymentTerms)
          ? Math.max(1, Math.round(data.paymentTerms))
          : 30,
      address: hasAddress ? data.address : null,
      institution_number: toOptionalText(data.institutionNumber),
      number_of_beds: toOptionalPositiveInteger(data.numberOfBeds),
      departments: normalizedDepartments.length > 0 ? normalizedDepartments : null,
      accreditation: toOptionalText(data.accreditation),
      social_links: hasSocialLinks ? data.socialLinks : null,
      image_url: toOptionalText(data.imageUrl),
      created_by_admin_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating institution:', error)
    throw error
  }

  return institution
}
