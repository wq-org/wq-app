import { FunctionsHttpError } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

import type { InstitutionDirectoryRow } from '../types/institution-users.types'

export type InviteTeacherStudentRole = 'teacher' | 'student'

type SendInstitutionUserInviteEmailResponse = {
  ok?: boolean
  error?: string
}

async function invokeSendUserInviteEmail(params: {
  inviteToken: string
  recipientEmail: string
  institutionName?: string | null
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke<SendInstitutionUserInviteEmailResponse>(
    'send-institution-user-invite-email',
    {
      body: {
        inviteToken: params.inviteToken,
        recipientEmail: params.recipientEmail.trim(),
        institutionName: params.institutionName?.trim() ?? undefined,
      },
    },
  )

  if (error) {
    if (error instanceof FunctionsHttpError) {
      let message = error.message
      try {
        const ctx: unknown = await error.context.json()
        if (
          ctx &&
          typeof ctx === 'object' &&
          'error' in ctx &&
          typeof (ctx as { error: unknown }).error === 'string'
        ) {
          message = (ctx as { error: string }).error
        }
      } catch {
        /* keep message */
      }
      throw new Error(message)
    }
    throw new Error(error.message)
  }

  if (!data?.ok) {
    throw new Error(data?.error ?? 'Failed to send invite email')
  }
}

export type BulkInviteItem = {
  email: string
  role: InviteTeacherStudentRole
}

export type BulkInviteResult = {
  succeeded: string[]
  failed: { email: string; message: string }[]
}

export async function createAndSendTeacherStudentInvite(params: {
  institutionId: string
  institutionName?: string | null
  email: string
  role: InviteTeacherStudentRole
}): Promise<void> {
  const { data: token, error: rpcError } = await supabase.rpc(
    'create_institution_invite_by_email',
    {
      p_institution_id: params.institutionId,
      p_email: params.email.trim(),
      p_role: params.role,
    },
  )

  if (rpcError) throw new Error(rpcError.message)
  if (!token || typeof token !== 'string') throw new Error('Invite token missing')

  await invokeSendUserInviteEmail({
    inviteToken: token,
    recipientEmail: params.email,
    institutionName: params.institutionName,
  })
}

export async function sendBulkTeacherStudentInvites(params: {
  institutionId: string
  institutionName?: string | null
  items: readonly BulkInviteItem[]
}): Promise<BulkInviteResult> {
  const succeeded: string[] = []
  const failed: { email: string; message: string }[] = []

  for (const item of params.items) {
    try {
      await createAndSendTeacherStudentInvite({
        institutionId: params.institutionId,
        institutionName: params.institutionName,
        email: item.email,
        role: item.role,
      })
      succeeded.push(item.email)
    } catch (e) {
      failed.push({
        email: item.email,
        message: e instanceof Error ? e.message : 'Unknown error',
      })
    }
  }

  return { succeeded, failed }
}

export async function resendTeacherStudentInviteEmail(params: {
  inviteToken: string
  recipientEmail: string
  institutionName?: string | null
}): Promise<void> {
  await invokeSendUserInviteEmail({
    inviteToken: params.inviteToken,
    recipientEmail: params.recipientEmail,
    institutionName: params.institutionName,
  })
}

type MembershipStatusDb = 'invited' | 'active' | 'suspended'

type MembershipRowDb = {
  user_id: string
  membership_role: string
  status: MembershipStatusDb
  profiles:
    | {
        email: string | null
        display_name: string | null
        username: string | null
        avatar_url: string | null
      }
    | {
        email: string | null
        display_name: string | null
        username: string | null
        avatar_url: string | null
      }[]
    | null
}

type MembershipProfileDb = {
  email: string | null
  display_name: string | null
  username: string | null
  avatar_url: string | null
}

function pickMembershipProfile(
  profileOrProfiles: MembershipRowDb['profiles'],
): MembershipProfileDb | null {
  if (Array.isArray(profileOrProfiles)) return profileOrProfiles[0] ?? null
  return profileOrProfiles
}

type InviteRowDb = {
  token: string
  email: string
  membership_role: string
  expires_at: string
}

export async function fetchInstitutionUserDirectory(
  institutionId: string,
): Promise<InstitutionDirectoryRow[]> {
  const [{ data: membershipRows, error: memErr }, { data: inviteRows, error: invErr }] =
    await Promise.all([
      supabase
        .from('institution_memberships')
        .select(
          `
          user_id,
          membership_role,
          status,
          profiles (
            email,
            display_name,
            username,
            avatar_url
          )
        `,
        )
        .eq('institution_id', institutionId)
        .is('deleted_at', null),
      supabase
        .from('institution_invites')
        .select('token, email, membership_role, expires_at')
        .eq('institution_id', institutionId)
        .is('accepted_at', null)
        .in('membership_role', ['teacher', 'student']),
    ])

  if (memErr) throw new Error(memErr.message)
  if (invErr) throw new Error(invErr.message)

  const memberEmails = new Set<string>()
  const members: InstitutionDirectoryRow[] = []

  for (const row of (membershipRows ?? []) as MembershipRowDb[]) {
    const prof = pickMembershipProfile(row.profiles)
    const emailLower = prof?.email?.toLowerCase().trim() ?? ''
    if (emailLower) memberEmails.add(emailLower)

    members.push({
      rowKind: 'member',
      user_id: row.user_id,
      email: prof?.email ?? null,
      display_name: prof?.display_name ?? null,
      username: prof?.username ?? null,
      avatar_url: prof?.avatar_url ?? null,
      membership_role: row.membership_role,
      membership_status: row.status,
    })
  }

  const invites: InstitutionDirectoryRow[] = []
  for (const inv of (inviteRows ?? []) as InviteRowDb[]) {
    const emailLower = String(inv.email).toLowerCase().trim()
    if (memberEmails.has(emailLower)) continue

    const role = inv.membership_role
    if (role !== 'teacher' && role !== 'student') continue

    invites.push({
      rowKind: 'invite',
      invite_token: inv.token,
      email: inv.email,
      membership_role: role,
      expires_at: inv.expires_at,
    })
  }

  const sortKey = (r: InstitutionDirectoryRow) => {
    const em = r.rowKind === 'member' ? (r.email ?? '') : r.email
    return em.toLowerCase()
  }

  return [...members, ...invites].sort((a, b) =>
    sortKey(a).localeCompare(sortKey(b), undefined, { sensitivity: 'base' }),
  )
}
