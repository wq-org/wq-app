import { supabase } from '@/lib/supabase'

import type { InstitutionInvite, InstitutionInviteRow } from '../types/institutionInvites.types'
import { resendInstitutionAdminInviteEmail } from './institutionApi'

const INVITE_SELECT =
  'id, institution_id, email, membership_role, token, expires_at, invited_by, accepted_at, accepted_user_id, revoked_at, revoked_by, created_at' as const

function toInstitutionInvite(row: InstitutionInviteRow): InstitutionInvite {
  return {
    id: row.id,
    institutionId: row.institution_id,
    email: row.email,
    membershipRole: row.membership_role,
    token: row.token,
    expiresAtIso: row.expires_at,
    invitedByUserId: row.invited_by,
    acceptedAtIso: row.accepted_at,
    acceptedUserId: row.accepted_user_id,
    revokedAtIso: row.revoked_at,
    revokedByUserId: row.revoked_by,
    createdAtIso: row.created_at,
  }
}

const PROFILE_EMAIL_CHUNK = 100

export async function listInstitutionInvites(): Promise<InstitutionInvite[]> {
  const { data, error } = await supabase
    .from('institution_invites')
    .select(INVITE_SELECT)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data ?? []) as InstitutionInviteRow[]).map(toInstitutionInvite)
}

export async function revokeInstitutionInvite(inviteId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('revoke_institution_invite', {
    p_invite_id: inviteId,
  })
  if (error) throw new Error(error.message)
  return data === true
}

export async function revokeExpiredInstitutionInvites(institutionId?: string): Promise<number> {
  const { data, error } = await supabase.rpc('revoke_expired_institution_invites', {
    p_institution_id: institutionId ?? null,
  })
  if (error) throw new Error(error.message)
  return typeof data === 'number' ? data : 0
}

/** Resolve `profiles.email` for inviter user ids (RLS: authenticated SELECT on profiles). */
export async function fetchEmailsForUserIds(
  userIds: readonly string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(userIds.filter((id) => id?.trim()))]
  const map = new Map<string, string>()
  if (unique.length === 0) return map

  for (let i = 0; i < unique.length; i += PROFILE_EMAIL_CHUNK) {
    const chunk = unique.slice(i, i + PROFILE_EMAIL_CHUNK)
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, email')
      .in('user_id', chunk)

    if (error) throw new Error(error.message)
    for (const row of data ?? []) {
      const uid = row.user_id as string
      const email = typeof row.email === 'string' ? row.email.trim() : ''
      if (email) map.set(uid, email)
    }
  }

  return map
}

/** Resend an institution invite email for a specific invite token. */
export async function resendInviteEmail(institutionId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await resendInstitutionAdminInviteEmail(institutionId)
}
