/**
 * Sends teacher/student institution invite emails via Brevo (same stack as admin invite).
 *
 * Local dev: `supabase/.env.local` + `npm run supabase:functions:serve` (loads env into the Functions runtime).
 *
 * Secrets: INSTITUTION_ADMIN_INVITE_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, PUBLIC_SITE_URL,
 * SUPABASE_URL, SUPABASE_ANON_KEY (match send-institution-admin-invite-email).
 *
 * Auth: Bearer JWT. Caller must be super_admin OR active institution_admin for invite.institution_id.
 * Invite row must be pending teacher/student, not expired; recipientEmail must match invite.email.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const brevoKey = Deno.env.get('INSTITUTION_ADMIN_INVITE_KEY')
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
  const senderName = Deno.env.get('BREVO_SENDER_NAME')
  const publicSiteUrlRaw = Deno.env.get('PUBLIC_SITE_URL')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (
    !brevoKey ||
    !senderEmail ||
    !senderName ||
    !publicSiteUrlRaw ||
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    console.error('send-institution-user-invite-email: missing required environment configuration')
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  const publicSiteUrl = publicSiteUrlRaw.replace(/\/$/, '')

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  let body: { inviteToken?: string; recipientEmail?: string; institutionName?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const inviteToken = typeof body.inviteToken === 'string' ? body.inviteToken.trim() : ''
  const recipientRaw = typeof body.recipientEmail === 'string' ? body.recipientEmail.trim() : ''
  const institutionNameFallback =
    typeof body.institutionName === 'string' ? body.institutionName.trim() : ''

  if (!inviteToken || !UUID_RE.test(inviteToken)) {
    return jsonResponse({ error: 'Invalid inviteToken' }, 400)
  }
  if (!recipientRaw || !recipientRaw.includes('@')) {
    return jsonResponse({ error: 'Invalid recipientEmail' }, 400)
  }

  const recipientNorm = recipientRaw.toLowerCase()

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const { data: invite, error: inviteError } = await supabase
    .from('institution_invites')
    .select('email, expires_at, accepted_at, institution_id, membership_role')
    .eq('token', inviteToken)
    .maybeSingle()

  if (inviteError || !invite) {
    return jsonResponse({ error: 'Invite not found' }, 400)
  }

  const role = invite.membership_role as string
  if (role !== 'teacher' && role !== 'student') {
    return jsonResponse({ error: 'Invalid invite role for this endpoint' }, 400)
  }

  if (invite.accepted_at != null) {
    return jsonResponse({ error: 'Invite already accepted' }, 400)
  }

  const expiresAt = new Date(invite.expires_at as string)
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    return jsonResponse({ error: 'Invite expired' }, 400)
  }

  const inviteEmailNorm = String(invite.email).toLowerCase().trim()
  if (inviteEmailNorm !== recipientNorm) {
    return jsonResponse({ error: 'Email does not match invite' }, 400)
  }

  const institutionId = invite.institution_id as string

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('profiles select:', profileError.message)
    return jsonResponse({ error: 'Could not verify caller' }, 500)
  }

  let maySend = profile?.is_super_admin === true

  if (!maySend) {
    const { data: adminMembership, error: adminErr } = await supabase
      .from('institution_memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('institution_id', institutionId)
      .eq('membership_role', 'institution_admin')
      .eq('status', 'active')
      .is('deleted_at', null)
      .maybeSingle()

    if (adminErr) {
      console.error('institution_memberships select:', adminErr.message)
      return jsonResponse({ error: 'Could not verify institution admin' }, 500)
    }
    maySend = !!adminMembership
  }

  if (!maySend) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  }

  const { data: institution, error: institutionError } = await supabase
    .from('institutions')
    .select('name')
    .eq('id', institutionId)
    .maybeSingle()

  if (institutionError) {
    console.error('institutions select:', institutionError.message)
    return jsonResponse({ error: 'Could not load institution' }, 500)
  }

  const displayName =
    (institution?.name && String(institution.name).trim()) ||
    institutionNameFallback ||
    'your institution'

  const roleLabel = role === 'teacher' ? 'teacher' : 'student'
  const inviteUrl = `${publicSiteUrl}/auth/invite?token=${encodeURIComponent(inviteToken)}`

  const subject = `Invitation to join ${displayName} (${roleLabel})`

  const textContent = [
    `You have been invited to join "${displayName}" as a ${roleLabel}.`,
    '',
    `Open this link to sign up (use ${recipientRaw}):`,
    inviteUrl,
    '',
    'This link expires on schedule. If you did not expect this email, you can ignore it.',
  ].join('\n')

  const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:24px 12px;background-color:#f5f7f8;font-family:system-ui,sans-serif;line-height:1.5;color:#111827;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:420px;background:#fff;border:1px solid rgba(17,24,39,0.08);border-radius:16px;">
<tr><td style="padding:22px 20px;">
<h1 style="margin:0 0 8px;font-size:20px;font-weight:600;">You're invited</h1>
<p style="margin:0 0 12px;font-size:14px;color:#4b5563;">
You have been invited to join <strong>${escapeHtml(displayName)}</strong> as a <strong>${escapeHtml(roleLabel)}</strong>.
</p>
<p style="margin:0 0 16px;font-size:14px;">Sign up using <strong>${escapeHtml(recipientRaw)}</strong>.</p>
<div style="text-align:center;margin:0 0 14px;">
<a href="${escapeHtml(inviteUrl)}" style="display:inline-block;padding:12px 14px;border-radius:10px;background:#007789;color:#fff!important;text-decoration:none;font-size:14px;font-weight:600;">Accept invitation</a>
</div>
<p style="margin:0;font-size:12px;color:#6b7280;">If the button does not work, copy this link:<br/><span style="word-break:break-all;color:#374151;">${escapeHtml(inviteUrl)}</span></p>
</td></tr></table></td></tr></table></body></html>`

  const brevoRes = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': brevoKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: recipientRaw, name: roleLabel }],
      subject,
      htmlContent,
      textContent,
      tags: ['institution_user_invite', roleLabel],
      headers: {
        'Idempotency-Key': `${inviteToken}:${recipientNorm}`,
      },
    }),
  })

  if (!brevoRes.ok) {
    const errBody = await brevoRes.text()
    console.error('Brevo error:', brevoRes.status, errBody)
    return jsonResponse({ error: 'Failed to send email' }, 502)
  }

  return jsonResponse({ ok: true }, 200)
})
