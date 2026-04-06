import { supabase } from '@/lib/supabase'
import type {
  BootstrapInstitutionFromWizardResult,
  Institution,
  InstitutionFormData,
  InstitutionRow,
  NewInstitutionWizardValues,
} from '../types/institution.types'

const INSTITUTION_COLUMNS = 'id, name, slug, type, status, email, image_url, created_at' as const

function toInstitution(row: InstitutionRow): Institution {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    status: row.status as Institution['status'],
    email: row.email,
    imageUrl: row.image_url,
    createdAt: new Date(row.created_at),
  }
}

function toOptionalText(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function toOptionalPositiveInteger(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/** Fetch all institutions ordered by creation date (newest first). */
export async function fetchInstitutions(): Promise<Institution[]> {
  const { data, error } = await supabase
    .from('institutions')
    .select(INSTITUTION_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as InstitutionRow[]).map(toInstitution)
}

/**
 * Create a new institution in the database.
 * Maps form data to the institutions schema (address and social_links as JSONB).
 */
export async function createInstitution(data: InstitutionFormData): Promise<Institution> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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
    .select(INSTITUTION_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return toInstitution(institution as InstitutionRow)
}

type InstitutionWizardBootstrapRpcRow = {
  institution_id: string
  invite_token: string
}

/**
 * Wizard flow:
 * 1) call bootstrap RPC (institution + settings + quotas + trial + invite token)
 * 2) patch institution metadata
 * 3) optionally scaffold faculty/programme
 */
export async function bootstrapInstitutionFromWizard(
  values: NewInstitutionWizardValues,
): Promise<BootstrapInstitutionFromWizardResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'create_institution_with_admin_email_invite',
    {
      p_name: values.name.trim(),
      p_admin_email: values.adminEmail.trim(),
    },
  )
  if (rpcError) throw new Error(rpcError.message)

  const row = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as
    | InstitutionWizardBootstrapRpcRow
    | null
    | undefined

  if (!row?.institution_id || !row?.invite_token) {
    throw new Error('Institution bootstrap returned no data')
  }

  const { data: institution, error: institutionError } = await supabase
    .from('institutions')
    .update({
      slug: toOptionalText(values.slug),
      type: values.type || null,
      legal_name: toOptionalText(values.legalName),
      billing_email: toOptionalText(values.billingEmail),
      email: toOptionalText(values.billingEmail || values.adminEmail),
      address: { country: values.country.trim() },
      status: 'active',
    })
    .eq('id', row.institution_id)
    .select(INSTITUTION_COLUMNS)
    .single()
  if (institutionError) throw new Error(institutionError.message)

  if (values.createInitialStructure && values.facultyName.trim()) {
    const { data: faculty, error: facultyError } = await supabase
      .from('faculties')
      .insert({
        institution_id: row.institution_id,
        name: values.facultyName.trim(),
        sort_order: 0,
      })
      .select('id')
      .single()
    if (facultyError) throw new Error(facultyError.message)

    if (values.programmeName.trim()) {
      const { error: programmeError } = await supabase.from('programmes').insert({
        institution_id: row.institution_id,
        faculty_id: faculty.id,
        name: values.programmeName.trim(),
        progression_type: 'year_group',
        sort_order: 0,
      })
      if (programmeError) throw new Error(programmeError.message)
    }
  }

  return {
    institution: toInstitution(institution as InstitutionRow),
    inviteToken: row.invite_token,
  }
}
