import { supabase } from '@/lib/supabase'

import type { InstitutionInvite, InstitutionInviteRow } from '../types/institutionInvites.types'

const INVITE_SELECT =
  'id, email, membership_role, token, expires_at, invited_by, accepted_at, accepted_user_id, created_at' as const

function toInstitutionInvite(row: InstitutionInviteRow): InstitutionInvite {
  return {
    id: row.id,
    email: row.email,
    membershipRole: row.membership_role,
    token: row.token,
    expiresAtIso: row.expires_at,
    invitedByUserId: row.invited_by,
    acceptedAtIso: row.accepted_at,
    acceptedUserId: row.accepted_user_id,
    createdAtIso: row.created_at,
  }
}

const PROFILE_EMAIL_CHUNK = 100

export async function listInstitutionInvites(): Promise<InstitutionInvite[]> {
  const { data, error } = await supabase
    .from('institution_invites')
    .select(INVITE_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data ?? []) as InstitutionInviteRow[]).map(toInstitutionInvite)
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
