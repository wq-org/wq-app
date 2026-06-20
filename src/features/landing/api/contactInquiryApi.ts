import { FunctionsHttpError } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

import type { ContactInquiryFormValues } from '@/features/landing/schemas/contact-inquiry.schema'

type SendContactInquiryResponse = {
  ok?: boolean
  error?: string
}

/** Sends the public contact inquiry to service@wq-app.de via Edge Function (Brevo server-side). */
export async function sendContactInquiry(values: ContactInquiryFormValues): Promise<void> {
  const { data, error } = await supabase.functions.invoke<SendContactInquiryResponse>(
    'send-contact-inquiry-email',
    {
      body: {
        institutionName: values.institutionName.trim(),
        cityState: values.cityState.trim(),
        institutionType: values.institutionType,
        contactName: values.contactName.trim(),
        contactRole: values.contactRole.trim(),
        contactEmail: values.contactEmail.trim(),
        contactPhone: values.contactPhone.trim(),
        estimatedLearners: values.estimatedLearners,
        estimatedTeachers: values.estimatedTeachers,
        desiredStartDate: values.desiredStartDate.trim(),
        useCaseDescription: values.useCaseDescription.trim(),
        existingSystems: values.existingSystems,
        existingSystemsOtherNote: values.existingSystemsOtherNote?.trim() || undefined,
        isPublicInstitution: values.isPublicInstitution,
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
    throw new Error(data?.error ?? 'Failed to send inquiry')
  }
}
