import { supabase } from '@/lib/supabase'

export type InstitutionMemberRole = 'institution_admin' | 'teacher' | 'student'

export const INSTITUTION_MEMBER_ROLES: readonly InstitutionMemberRole[] = [
  'institution_admin',
  'teacher',
  'student',
] as const

export type InstitutionAdminMember = {
  userId: string
  email: string | null
  displayName: string | null
  profileRole: string | null
  membershipRole: string
}

export type AdminSetInstitutionMemberRoleResult = {
  updated_user_id: string
  previous_role: string | null
  new_role: string
}

type MembershipProfile = {
  email: string | null
  display_name: string | null
  role: string | null
  is_super_admin: boolean | null
}

type MembershipProfileRow = {
  user_id: string
  membership_role: string
  profiles: MembershipProfile | MembershipProfile[] | null
}

function pickMembershipProfile(
  profileOrProfiles: MembershipProfileRow['profiles'],
): MembershipProfile | null {
  if (Array.isArray(profileOrProfiles)) return profileOrProfiles[0] ?? null
  return profileOrProfiles
}

/** Active institution_admin member for an institution (first match). */
export async function fetchInstitutionAdminMember(
  institutionId: string,
): Promise<InstitutionAdminMember | null> {
  const { data, error } = await supabase
    .from('institution_memberships')
    .select(
      'user_id, membership_role, profiles:user_id (email, display_name, role, is_super_admin)',
    )
    .eq('institution_id', institutionId)
    .eq('membership_role', 'institution_admin')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching institution admin member:', error)
    throw error
  }

  if (!data) return null

  const row = data as unknown as MembershipProfileRow
  const profile = pickMembershipProfile(row.profiles)
  if (profile?.is_super_admin || profile?.role === 'super_admin') return null

  return {
    userId: row.user_id,
    email: profile?.email ?? null,
    displayName: profile?.display_name ?? null,
    profileRole: profile?.role ?? null,
    membershipRole: row.membership_role,
  }
}

/** Super-admin RPC: sync profile role and active membership role at institution. */
export async function adminSetInstitutionMemberRole(
  institutionId: string,
  userId: string,
  newRole: InstitutionMemberRole,
): Promise<AdminSetInstitutionMemberRoleResult> {
  const { data, error } = await supabase.rpc('admin_set_institution_member_role', {
    p_institution_id: institutionId,
    p_user_id: userId,
    p_new_role: newRole,
  })

  if (error) {
    console.error('Error setting institution member role:', error)
    throw error
  }

  const row = Array.isArray(data) ? data[0] : data
  return (row ?? {}) as AdminSetInstitutionMemberRoleResult
}
