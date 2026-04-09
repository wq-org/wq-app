/**
 * Sends the institution-admin invite email via Resend (https://resend.com).
 *
 * Use this function when your verified sending domain is `updates.wq-app.de` (configure in Resend
 * dashboard). To switch from Brevo, deploy this function and call
 * `send-institution-admin-invite-email-resend` from `supabase.functions.invoke` instead of
 * `send-institution-admin-invite-email`.
 *
 * Required Supabase Edge secrets (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
 * - RESEND_API_KEY — Resend API key (Bearer token for api.resend.com).
 * - RESEND_SENDER_EMAIL — Verified address on your Resend domain (e.g. noreply@updates.wq-app.de).
 * - RESEND_SENDER_NAME — Display name for the From header (combined as "Name <email>").
 * - PUBLIC_SITE_URL — App origin without trailing slash (e.g. https://app.example.com) for signup links.
 *
 * Auto-provided by Supabase: SUPABASE_URL, SUPABASE_ANON_KEY.
 *
 * Sends `Idempotency-Key: <inviteToken>` to Resend (same token as Brevo’s idempotency header) to dedupe retries.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_URL = 'https://api.resend.com/emails'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const senderEmail = Deno.env.get('RESEND_SENDER_EMAIL')
  const senderName = Deno.env.get('RESEND_SENDER_NAME')
  const publicSiteUrlRaw = Deno.env.get('PUBLIC_SITE_URL')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (
    !resendKey ||
    !senderEmail ||
    !senderName ||
    !publicSiteUrlRaw ||
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    console.error(
      'send-institution-admin-invite-email-resend: missing required environment configuration',
    )
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  const publicSiteUrl = publicSiteUrlRaw.replace(/\/$/, '')

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  let body: { inviteToken?: string; adminEmail?: string; institutionName?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const inviteToken = typeof body.inviteToken === 'string' ? body.inviteToken.trim() : ''
  const adminEmailRaw = typeof body.adminEmail === 'string' ? body.adminEmail.trim() : ''
  const institutionNameFallback =
    typeof body.institutionName === 'string' ? body.institutionName.trim() : ''

  if (!inviteToken || !UUID_RE.test(inviteToken)) {
    return jsonResponse({ error: 'Invalid inviteToken' }, 400)
  }
  if (!adminEmailRaw || !adminEmailRaw.includes('@')) {
    return jsonResponse({ error: 'Invalid adminEmail' }, 400)
  }

  const adminEmailNorm = adminEmailRaw.toLowerCase()

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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError || !profile?.is_super_admin) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  }

  const { data: invite, error: inviteError } = await supabase
    .from('institution_invites')
    .select('email, expires_at, accepted_at, institution_id')
    .eq('token', inviteToken)
    .maybeSingle()

  if (inviteError || !invite) {
    return jsonResponse({ error: 'Invite not found' }, 400)
  }

  if (invite.accepted_at != null) {
    return jsonResponse({ error: 'Invite already accepted' }, 400)
  }

  const expiresAt = new Date(invite.expires_at as string)
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    return jsonResponse({ error: 'Invite expired' }, 400)
  }

  const inviteEmailNorm = String(invite.email).toLowerCase().trim()
  if (inviteEmailNorm !== adminEmailNorm) {
    return jsonResponse({ error: 'Email does not match invite' }, 400)
  }

  const { data: institution, error: institutionError } = await supabase
    .from('institutions')
    .select('name')
    .eq('id', invite.institution_id as string)
    .maybeSingle()

  if (institutionError) {
    console.error('institutions select:', institutionError.message)
    return jsonResponse({ error: 'Could not load institution' }, 500)
  }

  const displayName =
    (institution?.name && String(institution.name).trim()) ||
    institutionNameFallback ||
    'your institution'

  const inviteUrl = `${publicSiteUrl}/auth/invite?token=${encodeURIComponent(inviteToken)}`

  const subject = `Invitation: administer ${displayName}`

  const textContent = [
    `You have been invited to create an institution admin account for "${displayName}".`,
    '',
    `Open this link to sign up (use ${adminEmailRaw}):`,
    inviteUrl,
    '',
    'This link expires soon. If you did not expect this email, you can ignore it.',
  ].join('\n')

  const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
  <p>You have been invited to create an <strong>institution admin</strong> account for <strong>${escapeHtml(displayName)}</strong>.</p>
  <p>Sign up using <strong>${escapeHtml(adminEmailRaw)}</strong>:</p>
  <p><a href="${escapeHtml(inviteUrl)}">${escapeHtml(inviteUrl)}</a></p>
  <p style="color:#666;font-size:14px">This link expires soon. If you did not expect this email, you can ignore it.</p>
</body></html>`

  const fromHeader = `${senderName} <${senderEmail}>`

  const resendRes = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': inviteToken,
    },
    body: JSON.stringify({
      from: fromHeader,
      to: [adminEmailRaw],
      subject,
      html: htmlContent,
      text: textContent,
      tags: [{ name: 'category', value: 'institution_admin_invite' }],
    }),
  })

  if (!resendRes.ok) {
    const errBody = await resendRes.text()
    let logged = errBody
    try {
      const errJson = JSON.parse(errBody) as { message?: string }
      if (typeof errJson?.message === 'string') logged = errJson.message
    } catch {
      /* keep raw body */
    }
    console.error('Resend error:', resendRes.status, logged)
    return jsonResponse({ error: 'Failed to send email' }, 502)
  }

  return jsonResponse({ ok: true }, 200)
})

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
