/**
 * Redeems an institution email change token, updates the auth account and the
 * mirrored public rows, and signs the current session out.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

import { sha256Hex } from '../_shared/tokenHash.ts'

const TOKEN_RE = /^[A-Za-z0-9._=-]{24,}$/

function jsonResponse(body: unknown, status: number, origin = '*') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
    },
  })
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

Deno.serve(async (req) => {
  const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL')?.trim().replace(/\/+$/, '') ?? ''
  const origin = publicSiteUrl ? new URL(publicSiteUrl).origin : '*'

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, origin)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500, origin)
  }

  let body: { token?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, origin)
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  if (!token || !TOKEN_RE.test(token)) {
    return jsonResponse({ error: 'Invalid confirmation link.' }, 400, origin)
  }

  const serviceSupabase = createClient(supabaseUrl, serviceRoleKey)
  const tokenHash = await sha256Hex(token)

  const { data: pending, error: pendingError } = await serviceSupabase
    .from('pending_email_changes')
    .select(
      'id, institution_id, requested_by, current_email, target_email, expires_at, redeemed_at, created_at',
    )
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (pendingError) {
    return jsonResponse({ error: pendingError.message }, 500, origin)
  }
  if (!pending) {
    return jsonResponse({ error: 'Invalid confirmation link.' }, 400, origin)
  }

  if (pending.redeemed_at) {
    return jsonResponse({ error: 'This link has already been used.' }, 409, origin)
  }

  const expiresAt = new Date(pending.expires_at as string)
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    return jsonResponse({ error: 'This link has expired. Please request a new one.' }, 410, origin)
  }

  const targetEmail = normalizeEmail(String(pending.target_email))
  const currentEmail = normalizeEmail(String(pending.current_email))

  const { data: existingProfile, error: existingProfileError } = await serviceSupabase
    .from('profiles')
    .select('user_id')
    .ilike('email', targetEmail)
    .neq('user_id', pending.requested_by)
    .maybeSingle()

  if (existingProfileError) {
    return jsonResponse({ error: existingProfileError.message }, 500, origin)
  }
  if (existingProfile) {
    return jsonResponse({ error: 'This email is already registered.' }, 422, origin)
  }

  const { data: authUser, error: authUserError } = await serviceSupabase.auth.admin.updateUserById(
    String(pending.requested_by),
    {
      email: targetEmail,
    },
  )

  if (authUserError || !authUser.user) {
    return jsonResponse(
      { error: authUserError?.message ?? 'Failed to update the auth account.' },
      500,
      origin,
    )
  }

  const { error: profileError } = await serviceSupabase
    .from('profiles')
    .update({
      email: targetEmail,
      is_onboarded: false,
    })
    .eq('user_id', pending.requested_by)

  if (profileError) {
    return jsonResponse({ error: profileError.message }, 500, origin)
  }

  const { error: institutionError } = await serviceSupabase
    .from('institutions')
    .update({ email: targetEmail })
    .eq('id', pending.institution_id)

  if (institutionError) {
    return jsonResponse({ error: institutionError.message }, 500, origin)
  }

  const { error: redeemError } = await serviceSupabase
    .from('pending_email_changes')
    .update({ redeemed_at: new Date().toISOString() })
    .eq('id', pending.id)

  if (redeemError) {
    return jsonResponse({ error: redeemError.message }, 500, origin)
  }

  // Best-effort: revoke the requester's existing sessions so the old email can no
  // longer sign in. The email change above is already committed and the operation
  // is authorized by the body token (not this header), so a failure here must NOT
  // fail the request. The redeem link is opened from the new inbox, often without
  // an active session — then supabase-js sends the anon key as the bearer token,
  // whose JWT has no `sub` claim and makes admin.signOut throw "missing sub claim".
  // The client also signs out locally once this call resolves.
  const authHeader = req.headers.get('Authorization')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')?.trim() ?? ''
  const currentToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : ''
  if (currentToken && currentToken !== anonKey && currentToken !== serviceRoleKey) {
    const { error: signOutError } = await serviceSupabase.auth.admin.signOut(currentToken, 'global')
    if (signOutError) {
      console.warn(
        'redeem-email-change: best-effort session sign-out failed:',
        signOutError.message,
      )
    }
  }

  const { error: auditError } = await serviceSupabase.rpc('log_audit_event', {
    p_event_type: 'institution_email_changed',
    p_subject_type: 'institution',
    p_subject_id: pending.institution_id,
    p_institution_id: pending.institution_id,
    p_payload: {
      previous_email: currentEmail,
      new_email: targetEmail,
      requested_by: pending.requested_by,
    },
  })

  if (auditError) {
    return jsonResponse({ error: auditError.message }, 500, origin)
  }

  return jsonResponse(
    {
      ok: true,
      redirectTo: `${publicSiteUrl || ''}/auth/login`,
    },
    200,
    origin,
  )
})
