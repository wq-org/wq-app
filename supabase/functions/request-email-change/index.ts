/**
 * Creates a one-time institution email change request and sends the confirmation link
 * to the new address.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

import { escapeHtml, emailMutedNote, emailParagraph, wrapEmailCard } from '../_shared/emailHtml.ts'
import { sha256Hex } from '../_shared/tokenHash.ts'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOKEN_LIFETIME_MS = 10 * 60 * 1000
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

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
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const brevoKey = Deno.env.get('INSTITUTION_ADMIN_INVITE_KEY')
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
  const senderName = Deno.env.get('BREVO_SENDER_NAME')

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !anonKey ||
    !brevoKey ||
    !senderEmail ||
    !senderName ||
    !publicSiteUrl
  ) {
    return jsonResponse({ error: 'Server configuration error' }, 500, origin)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401, origin)
  }

  let body: { institutionId?: string; targetEmail?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, origin)
  }

  const institutionId = typeof body.institutionId === 'string' ? body.institutionId.trim() : ''
  const targetEmailRaw = typeof body.targetEmail === 'string' ? body.targetEmail.trim() : ''
  const targetEmail = normalizeEmail(targetEmailRaw)

  if (!institutionId || !UUID_RE.test(institutionId)) {
    return jsonResponse({ error: 'Invalid institutionId' }, 400, origin)
  }
  if (!targetEmail || !EMAIL_RE.test(targetEmail)) {
    return jsonResponse({ error: 'Invalid targetEmail' }, 422, origin)
  }

  const authSupabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const serviceSupabase = createClient(supabaseUrl, serviceRoleKey)

  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser()

  if (userError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401, origin)
  }

  const providers = new Set<string>()
  if (Array.isArray(user.identities)) {
    for (const identity of user.identities) {
      if (identity?.provider) providers.add(identity.provider)
    }
  }

  const metadataProviders = (user.app_metadata as { providers?: unknown } | undefined)?.providers
  if (Array.isArray(metadataProviders)) {
    for (const provider of metadataProviders) {
      if (typeof provider === 'string') providers.add(provider)
    }
  }

  if (providers.size > 0 && [...providers].some((provider) => provider !== 'email')) {
    return jsonResponse(
      {
        error:
          'Your account uses single sign-on. Contact your identity provider to change your email.',
      },
      403,
      origin,
    )
  }

  const currentEmail = normalizeEmail(user.email ?? '')
  if (!currentEmail) {
    return jsonResponse({ error: 'Current email is unavailable' }, 500, origin)
  }

  if (currentEmail === targetEmail) {
    return jsonResponse(
      { error: 'The new email must be different from the current email.' },
      422,
      origin,
    )
  }

  const { data: membership, error: membershipError } = await serviceSupabase
    .from('institution_memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('institution_id', institutionId)
    .eq('membership_role', 'institution_admin')
    .eq('status', 'active')
    .is('deleted_at', null)
    .is('left_institution_at', null)
    .maybeSingle()

  if (membershipError) {
    return jsonResponse({ error: membershipError.message }, 500, origin)
  }
  if (!membership) {
    return jsonResponse({ error: 'You are not an admin of this institution' }, 403, origin)
  }

  const { data: existingProfile, error: existingProfileError } = await serviceSupabase
    .from('profiles')
    .select('user_id')
    .ilike('email', targetEmail)
    .neq('user_id', user.id)
    .maybeSingle()

  if (existingProfileError) {
    return jsonResponse({ error: existingProfileError.message }, 500, origin)
  }
  if (existingProfile) {
    return jsonResponse({ error: 'This email is already registered.' }, 422, origin)
  }

  const { data: institution, error: institutionError } = await serviceSupabase
    .from('institutions')
    .select('name')
    .eq('id', institutionId)
    .maybeSingle()

  if (institutionError) {
    return jsonResponse({ error: institutionError.message }, 500, origin)
  }

  const rawToken = `${crypto.randomUUID()}${crypto.randomUUID()}`
  const tokenHash = await sha256Hex(rawToken)
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS).toISOString()

  const { error: expireError } = await serviceSupabase
    .from('pending_email_changes')
    .update({ expires_at: new Date().toISOString() })
    .eq('institution_id', institutionId)
    .is('redeemed_at', null)

  if (expireError) {
    return jsonResponse({ error: expireError.message }, 500, origin)
  }

  const { error: insertError } = await serviceSupabase.from('pending_email_changes').insert({
    institution_id: institutionId,
    requested_by: user.id,
    current_email: currentEmail,
    target_email: targetEmail,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  if (insertError) {
    return jsonResponse({ error: insertError.message }, 500, origin)
  }

  const confirmationLink = `${publicSiteUrl}/auth/change-email?token=${encodeURIComponent(rawToken)}`
  const displayName = institution?.name?.trim() || 'your institution'

  const emailHtml = wrapEmailCard(
    'Confirm your institution email change',
    [
      emailParagraph(
        `A request was made to change the login email for <strong>${escapeHtml(displayName)}</strong> to <strong>${escapeHtml(targetEmail)}</strong>.`,
      ),
      emailParagraph(`Open the confirmation link below within 10 minutes to approve the change.`),
      `<p style="margin:18px 0;text-align:center;">
        <a href="${escapeHtml(confirmationLink)}" style="display:inline-block;padding:12px 14px;border-radius:10px;background:#0f766e;color:#fff!important;text-decoration:none;font-size:14px;font-weight:600;">Confirm email change</a>
      </p>`,
      emailMutedNote(`If the button does not work, copy this link: ${confirmationLink}.`),
      emailMutedNote('If you did not request this change, you can ignore this email.'),
    ].join(''),
  )

  const brevoRes = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': brevoKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: targetEmail, name: displayName }],
      subject: 'Confirm your institution email change',
      htmlContent: emailHtml,
      textContent: [
        `Confirm the institution email change for ${displayName}.`,
        '',
        `Open this link within 10 minutes: ${confirmationLink}`,
      ].join('\n'),
      tags: ['institution_email_change', 'request'],
    }),
  })

  if (!brevoRes.ok) {
    const bodyText = await brevoRes.text()
    return jsonResponse({ error: `Failed to send email: ${bodyText}` }, 502, origin)
  }

  const { error: auditError } = await serviceSupabase.rpc('log_audit_event', {
    p_event_type: 'institution_email_change_requested',
    p_subject_type: 'institution',
    p_subject_id: institutionId,
    p_institution_id: institutionId,
    p_payload: {
      current_email: currentEmail,
      target_email: targetEmail,
      expires_at: expiresAt,
    },
  })

  if (auditError) {
    return jsonResponse({ error: auditError.message }, 500, origin)
  }

  return jsonResponse(
    {
      ok: true,
      expiresAt,
      targetEmail,
    },
    200,
    origin,
  )
})
