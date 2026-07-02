/**
 * Sends institution contact-inquiry submissions to service@wq-app.de via Brevo.
 *
 * Public endpoint (no user JWT). Input is validated server-side before send.
 *
 * Local dev: `supabase/.env.local` + `npm run supabase:functions:serve`.
 *
 * Secrets (same stack as invite emails unless noted):
 * - BREVO_API_KEY — Brevo API key
 * - BREVO_SENDER_EMAIL — Verified sender address in Brevo
 * - BREVO_SENDER_NAME — From display name
 * - CONTACT_INQUIRY_RECIPIENT_EMAIL — optional; defaults to service@wq-app.de
 */
import {
  emailDetailBlock,
  emailMutedNote,
  emailParagraph,
  escapeHtml,
  wrapEmailCard,
} from '../_shared/emailHtml.ts'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'
const DEFAULT_RECIPIENT = 'service@wq-app.de'
const MIN_USE_CASE_LENGTH = 30
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INSTITUTION_TYPE_KEYS = [
  'vocationalSchool',
  'nursingSchool',
  'clinic',
  'educationCenter',
  'university',
  'companyTraining',
  'other',
] as const

const EXISTING_SYSTEM_KEYS = [
  'taskCards',
  'padlet',
  'edumaps',
  'microsoft365Education',
  'googleWorkspaceEducation',
  'appleSchoolManager',
  'moodle',
  'mebis',
  'logineo',
  'itslearning',
  'hpiSchulcloudLandescloud',
  'ilias',
  'other',
] as const

const YES_NO_VALUES = ['yes', 'no'] as const

type InstitutionTypeKey = (typeof INSTITUTION_TYPE_KEYS)[number]
type ExistingSystemKey = (typeof EXISTING_SYSTEM_KEYS)[number]
type YesNoValue = (typeof YES_NO_VALUES)[number]

type ContactInquiryPayload = {
  institutionName: string
  cityState: string
  institutionType: InstitutionTypeKey
  contactName: string
  contactRole: string
  contactEmail: string
  contactPhone: string
  estimatedLearners: number
  estimatedTeachers: number
  desiredStartDate: string
  useCaseDescription: string
  existingSystems: ExistingSystemKey[]
  existingSystemsOtherNote?: string
  isPublicInstitution: YesNoValue
}

const INSTITUTION_TYPE_LABELS: Record<InstitutionTypeKey, string> = {
  vocationalSchool: 'Vocational school (Berufsschule)',
  nursingSchool: 'Nursing school (Pflegeschule)',
  clinic: 'Clinic / hospital',
  educationCenter: 'Education center (Bildungszentrum)',
  university: 'University / college',
  companyTraining: 'Company training department',
  other: 'Other',
}

const EXISTING_SYSTEM_LABELS: Record<ExistingSystemKey, string> = {
  taskCards: 'TaskCards',
  padlet: 'Padlet',
  edumaps: 'Edumaps',
  microsoft365Education: 'Microsoft 365 Education',
  googleWorkspaceEducation: 'Google Workspace for Education',
  appleSchoolManager: 'Apple School Manager',
  moodle: 'Moodle',
  mebis: 'mebis',
  logineo: 'LOGINEO LMS',
  itslearning: 'itslearning',
  hpiSchulcloudLandescloud: 'HPI Schulcloud / state cloud',
  ilias: 'ILIAS',
  other: 'Other',
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function trimString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function parseNonNegativeInt(value: unknown): number | null {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) return null
  if (num > 1_000_000) return null
  return num
}

function isInstitutionType(value: string): value is InstitutionTypeKey {
  return (INSTITUTION_TYPE_KEYS as readonly string[]).includes(value)
}

function isExistingSystem(value: string): value is ExistingSystemKey {
  return (EXISTING_SYSTEM_KEYS as readonly string[]).includes(value)
}

function isYesNo(value: string): value is YesNoValue {
  return (YES_NO_VALUES as readonly string[]).includes(value)
}

function parseContactInquiryBody(body: unknown): {
  payload?: ContactInquiryPayload
  error?: string
} {
  if (!body || typeof body !== 'object') {
    return { error: 'Invalid request body' }
  }

  const raw = body as Record<string, unknown>

  const institutionName = trimString(raw.institutionName, 200)
  const cityState = trimString(raw.cityState, 200)
  const institutionTypeRaw = trimString(raw.institutionType, 64)
  const contactName = trimString(raw.contactName, 200)
  const contactRole = trimString(raw.contactRole, 200)
  const contactEmail = trimString(raw.contactEmail, 254)
  const contactPhone = trimString(raw.contactPhone, 50)
  const desiredStartDate = trimString(raw.desiredStartDate, 10)
  const useCaseDescription = trimString(raw.useCaseDescription, 5000)
  const existingSystemsOtherNote = trimString(raw.existingSystemsOtherNote, 2000)
  const isPublicInstitutionRaw = trimString(raw.isPublicInstitution, 8)

  if (!institutionName) return { error: 'Institution name is required' }
  if (!cityState) return { error: 'City / state is required' }
  if (!isInstitutionType(institutionTypeRaw)) return { error: 'Invalid institution type' }
  if (!contactName) return { error: 'Contact name is required' }
  if (!contactRole) return { error: 'Contact role is required' }
  if (!contactEmail || !EMAIL_RE.test(contactEmail)) return { error: 'Valid email is required' }
  if (!contactPhone) return { error: 'Phone number is required' }

  const estimatedLearners = parseNonNegativeInt(raw.estimatedLearners)
  if (estimatedLearners == null) return { error: 'Invalid estimated learners count' }

  const estimatedTeachers = parseNonNegativeInt(raw.estimatedTeachers)
  if (estimatedTeachers == null) return { error: 'Invalid estimated teachers count' }

  if (!desiredStartDate || !ISO_DATE_RE.test(desiredStartDate)) {
    return { error: 'Invalid desired start date' }
  }

  const parsedDate = new Date(`${desiredStartDate}T12:00:00.000Z`)
  if (Number.isNaN(parsedDate.getTime())) {
    return { error: 'Invalid desired start date' }
  }

  if (useCaseDescription.length < MIN_USE_CASE_LENGTH) {
    return { error: `Use case description must be at least ${MIN_USE_CASE_LENGTH} characters` }
  }

  if (!Array.isArray(raw.existingSystems) || raw.existingSystems.length === 0) {
    return { error: 'Select at least one existing system' }
  }

  const existingSystems: ExistingSystemKey[] = []
  for (const item of raw.existingSystems) {
    if (typeof item !== 'string' || !isExistingSystem(item)) {
      return { error: 'Invalid existing system selection' }
    }
    if (!existingSystems.includes(item)) {
      existingSystems.push(item)
    }
  }

  if (existingSystems.includes('other') && !existingSystemsOtherNote) {
    return { error: 'Please specify additional software' }
  }

  if (!isYesNo(isPublicInstitutionRaw)) {
    return { error: 'Please indicate whether this is a public institution' }
  }

  return {
    payload: {
      institutionName,
      cityState,
      institutionType: institutionTypeRaw,
      contactName,
      contactRole,
      contactEmail,
      contactPhone,
      estimatedLearners,
      estimatedTeachers,
      desiredStartDate,
      useCaseDescription,
      existingSystems,
      existingSystemsOtherNote: existingSystemsOtherNote || undefined,
      isPublicInstitution: isPublicInstitutionRaw,
    },
  }
}

function formatIsoDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`)
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function buildEmailContent(payload: ContactInquiryPayload) {
  const institutionTypeLabel = INSTITUTION_TYPE_LABELS[payload.institutionType]
  const publicLabel = payload.isPublicInstitution === 'yes' ? 'Public' : 'Private'
  const systemsLabel = payload.existingSystems.map((key) => EXISTING_SYSTEM_LABELS[key]).join(', ')

  const subject = `Institution inquiry: ${payload.institutionName}`

  const textLines = [
    'New institution contact inquiry',
    '',
    `Institution: ${payload.institutionName}`,
    `Location: ${payload.cityState}`,
    `Type: ${institutionTypeLabel}`,
    `Public institution: ${publicLabel}`,
    '',
    `Contact: ${payload.contactName} (${payload.contactRole})`,
    `Email: ${payload.contactEmail}`,
    `Phone: ${payload.contactPhone}`,
    '',
    `Estimated learners: ${payload.estimatedLearners}`,
    `Estimated teachers: ${payload.estimatedTeachers}`,
    `Desired start: ${formatIsoDate(payload.desiredStartDate)}`,
    '',
    'Use case:',
    payload.useCaseDescription,
    '',
    `Existing systems: ${systemsLabel}`,
  ]

  if (payload.existingSystemsOtherNote) {
    textLines.push('', 'Other systems note:', payload.existingSystemsOtherNote)
  }

  const textContent = textLines.join('\n')

  const bodyHtml = [
    emailParagraph(
      `A new inquiry was submitted via the public contact form for <strong style="color:#111827;">${escapeHtml(payload.institutionName)}</strong>.`,
    ),
    emailDetailBlock('Institution', payload.institutionName),
    emailDetailBlock('City / state', payload.cityState),
    emailDetailBlock('Institution type', institutionTypeLabel),
    emailDetailBlock('Public institution', publicLabel),
    emailDetailBlock('Contact name', payload.contactName),
    emailDetailBlock('Role', payload.contactRole),
    emailDetailBlock('Email', payload.contactEmail),
    emailDetailBlock('Phone', payload.contactPhone),
    emailDetailBlock('Estimated learners', String(payload.estimatedLearners)),
    emailDetailBlock('Estimated teachers', String(payload.estimatedTeachers)),
    emailDetailBlock('Desired start date', formatIsoDate(payload.desiredStartDate)),
    emailDetailBlock('Existing systems', systemsLabel),
    emailParagraph(
      `<strong style="color:#111827;">Use case</strong><br/>${escapeHtml(payload.useCaseDescription).replace(/\n/g, '<br/>')}`,
      payload.existingSystemsOtherNote ? '12px' : '14px',
    ),
    payload.existingSystemsOtherNote
      ? emailParagraph(
          `<strong style="color:#111827;">Other systems</strong><br/>${escapeHtml(payload.existingSystemsOtherNote).replace(/\n/g, '<br/>')}`,
          '14px',
        )
      : '',
    emailMutedNote('Reply directly to the contact email address to follow up.'),
  ].join('')

  const htmlContent = wrapEmailCard('New institution inquiry', bodyHtml)

  return { subject, textContent, htmlContent }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const brevoKey = Deno.env.get('BREVO_API_KEY')
  const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL')
  const senderName = Deno.env.get('BREVO_SENDER_NAME')
  const recipientEmail =
    Deno.env.get('CONTACT_INQUIRY_RECIPIENT_EMAIL')?.trim() || DEFAULT_RECIPIENT

  const missingConfigFields = [
    !brevoKey ? 'BREVO_API_KEY' : null,
    !senderEmail ? 'BREVO_SENDER_EMAIL' : null,
    !senderName ? 'BREVO_SENDER_NAME' : null,
  ].filter((field): field is string => Boolean(field))

  if (missingConfigFields.length > 0) {
    const errorMessage = `Missing required environment configuration: ${missingConfigFields.join(', ')}`
    console.error(`send-contact-inquiry-email: ${errorMessage}`)
    return jsonResponse({ error: errorMessage }, 500)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const { payload, error: validationError } = parseContactInquiryBody(body)
  if (!payload) {
    return jsonResponse({ error: validationError ?? 'Invalid input' }, 400)
  }

  const { subject, textContent, htmlContent } = buildEmailContent(payload)

  const brevoRes = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': brevoKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: recipientEmail, name: 'WQ Service' }],
      replyTo: { email: payload.contactEmail, name: payload.contactName },
      subject,
      htmlContent,
      textContent,
      tags: ['contact_inquiry'],
      headers: {
        'Idempotency-Key': `contact-inquiry:${crypto.randomUUID()}`,
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
