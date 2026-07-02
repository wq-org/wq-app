import { FunctionsHttpError } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

export type RequestInstitutionEmailChangeParams = {
  institutionId: string
  targetEmail: string
}

export type RequestInstitutionEmailChangeResponse = {
  ok?: boolean
  expiresAt?: string
  targetEmail?: string
  error?: string
}

export type RedeemInstitutionEmailChangeResponse = {
  ok?: boolean
  targetEmail?: string
  redirectTo?: string
  error?: string
}

async function unwrapFunctionError(error: unknown, fallbackMessage: string): Promise<Error> {
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
    return new Error(message)
  }

  return new Error(error instanceof Error ? error.message : fallbackMessage)
}

export async function requestInstitutionEmailChange(
  params: RequestInstitutionEmailChangeParams,
): Promise<{ expiresAt: string; targetEmail: string }> {
  const { data, error } = await supabase.functions.invoke<RequestInstitutionEmailChangeResponse>(
    'request-email-change',
    {
      body: {
        institutionId: params.institutionId,
        targetEmail: params.targetEmail.trim(),
      },
    },
  )

  if (error) {
    throw await unwrapFunctionError(error, 'Failed to request email change')
  }

  if (!data?.ok || !data.expiresAt || !data.targetEmail) {
    throw new Error(data?.error ?? 'Failed to request email change')
  }

  return {
    expiresAt: data.expiresAt,
    targetEmail: data.targetEmail,
  }
}

export async function redeemInstitutionEmailChange(
  token: string,
): Promise<{ targetEmail: string | null }> {
  const { data, error } = await supabase.functions.invoke<RedeemInstitutionEmailChangeResponse>(
    'redeem-email-change',
    {
      body: {
        token,
      },
    },
  )

  if (error) {
    throw await unwrapFunctionError(error, 'Failed to redeem email change')
  }

  if (!data?.ok) {
    throw new Error(data?.error ?? 'Failed to redeem email change')
  }

  return { targetEmail: data.targetEmail?.trim() || null }
}
