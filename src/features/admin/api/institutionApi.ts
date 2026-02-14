import { supabase } from '@/lib/supabase'
import type { InstitutionFormData } from '@/features/admin/types/institution.types'

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

  const { data: institution, error } = await supabase
    .from('institutions')
    .insert({
      name: data.name.trim(),
      slug: data.slug.trim() || null,
      type: data.type || null,
      status: data.status ?? 'active',
      description: data.description?.trim() || null,
      email: data.email?.trim() || null,
      website: data.website?.trim() || null,
      address: hasAddress ? data.address : null,
      social_links: hasSocialLinks ? data.socialLinks : null,
      image_url: data.imageUrl?.trim() || null,
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
