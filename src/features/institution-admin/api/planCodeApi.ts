import { supabase } from '@/lib/supabase'

/**
 * Resolves a human-readable plan code (e.g. "Trial") from a plan UUID.
 * The subscription join already returns plan_catalog when RLS permits; this
 * is a fallback for when that join returns null.
 */
export async function resolvePlanCode(planId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('plan_catalog')
    .select('code')
    .eq('id', planId)
    .maybeSingle()

  if (error) {
    console.warn('resolvePlanCode:', error.message)
    return null
  }
  return (data as { code: string } | null)?.code ?? null
}
