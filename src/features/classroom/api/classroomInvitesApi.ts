import { FunctionsHttpError } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

import type { ClassroomPendingInvite, ClassroomPendingInviteRow } from '../types/classroom.types'

type SendInviteEmailResponse = {
  ok?: boolean
  error?: string
}

async function invokeSendInviteEmail(params: {
  inviteToken: string
  recipientEmail: string
  institutionName?: string | null
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke<SendInviteEmailResponse>(
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

export async function createAndSendClassroomStudentInvite(params: {
  classroomId: string
  email: string
  institutionName?: string | null
}): Promise<void> {
  const { data: token, error: rpcError } = await supabase.rpc('create_classroom_student_invite', {
    p_classroom_id: params.classroomId,
    p_email: params.email.trim(),
  })

  if (rpcError) throw new Error(rpcError.message)
  if (!token || typeof token !== 'string') throw new Error('Invite token missing')

  await invokeSendInviteEmail({
    inviteToken: token,
    recipientEmail: params.email,
    institutionName: params.institutionName,
  })
}

export async function listClassroomPendingInvites(
  classroomId: string,
): Promise<ClassroomPendingInvite[]> {
  const { data, error } = await supabase
    .from('institution_invites')
    .select('id, email, expires_at')
    .eq('classroom_id', classroomId)
    .eq('membership_role', 'student')
    .is('accepted_at', null)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('listClassroomPendingInvites:', error)
    throw error
  }

  return (data ?? []).map((row) => {
    const r = row as ClassroomPendingInviteRow
    return {
      id: r.id,
      email: r.email,
      expiresAt: r.expires_at,
    }
  })
}
