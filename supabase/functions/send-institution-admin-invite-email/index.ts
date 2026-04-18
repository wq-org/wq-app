/**
 * Sends the institution-admin invite email via Brevo transactional API.
 *
 * Local dev: put the same keys in `supabase/.env.local`, then run `npm run supabase:functions:serve`.
 *
 * Required Supabase Edge secrets (Dashboard → Edge Functions → Secrets, or `npm run supabase:secrets:push`):
 * - INSTITUTION_ADMIN_INVITE_KEY — Brevo API key (sent as `api-key` header; see Brevo sendTransacEmail docs).
 * - BREVO_SENDER_EMAIL — Verified sender address in Brevo.
 * - BREVO_SENDER_NAME — Display name for the From header.
 * - PUBLIC_SITE_URL — App origin without trailing slash (e.g. https://app.example.com) for signup links.
 *
 * Auto-provided by Supabase: SUPABASE_URL, SUPABASE_ANON_KEY (and SERVICE_ROLE_KEY if needed later).
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
    console.error('send-institution-admin-invite-email: missing required environment configuration')
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
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Institution admin invite</title>
  </head>
  <body
    style="
      margin:0;
      padding:24px 12px;
      background-color:#f5f7f8;
      font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      line-height:1.5;
      color:#111827;
    "
  >
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="border-collapse:collapse;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="
              border-collapse:collapse;
              max-width:420px;
              background-color:#ffffff;
              border:1px solid rgba(17,24,39,0.08);
              border-radius:16px;
              box-shadow:0 14px 26px rgba(0,0,0,0.08);
            "
          >
            <tr>
              <td style="padding:22px 20px 18px 20px;">
                <h1
                  style="
                    margin:0 0 8px 0;
                    font-size:20px;
                    line-height:1.3;
                    font-weight:600;
                    color:#111827;
                  "
                >
                  Institution admin invite
                </h1>

                <p
                  style="
                    margin:0 0 12px 0;
                    font-size:14px;
                    line-height:1.6;
                    color:#4b5563;
                  "
                >
                  You have been invited to create an
                  <strong style="color:#111827;">institution admin</strong>
                  account for
                  <strong style="color:#111827;">${escapeHtml(displayName)}</strong>.
                </p>

                <p
                  style="
                    margin:0 0 16px 0;
                    font-size:14px;
                    line-height:1.6;
                    color:#374151;
                  "
                >
                  Sign up using
                  <strong style="color:#111827;">${escapeHtml(adminEmailRaw)}</strong>.
                </p>

                <div style="text-align:center;margin:0 0 14px 0;">
                  <a
                    href="${escapeHtml(inviteUrl)}"
                    style="
                      display:inline-block;
                      width:88%;
                      max-width:320px;
                      padding:12px 14px;
                      border-radius:10px;
                      background-color:#007789;
                      color:#ffffff !important;
                      text-decoration:none;
                      font-size:14px;
                      font-weight:600;
                      text-align:center;
                    "
                  >
                    Create account
                  </a>
                </div>

                <p
                  style="
                    margin:0 0 12px 0;
                    font-size:12px;
                    line-height:1.6;
                    color:#6b7280;
                  "
                >
                  If the button does not work, copy and paste this link into your browser:
                </p>

                <p
                  style="
                    margin:0 0 14px 0;
                    padding:10px 12px;
                    background-color:#f9fafb;
                    border:1px solid #e5e7eb;
                    border-radius:10px;
                    font-size:12px;
                    line-height:1.6;
                    word-break:break-all;
                    color:#374151;
                  "
                >
                  <a
                    href="${escapeHtml(inviteUrl)}"
                    style="color:#007789;text-decoration:none;"
                  >${escapeHtml(inviteUrl)}</a>
                </p>

                <p
                  style="
                    margin:0;
                    font-size:12px;
                    line-height:1.6;
                    color:#6b7280;
                  "
                >
                  This link expires soon. If you did not expect this email, you can ignore it.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const brevoRes = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': brevoKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: adminEmailRaw, name: 'Admin' }],
      subject,
      htmlContent,
      textContent,
      tags: ['institution_admin_invite'],
      headers: {
        'Idempotency-Key': inviteToken,
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
