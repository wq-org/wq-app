import { supabase } from '@/lib/supabase'

export type InstitutionAuditEventRow = {
  id: string
  occurred_at: string
  actor_user_id: string | null
  event_type: string
  subject_type: string | null
  subject_id: string | null
  institution_id: string | null
  payload: unknown
  metadata: unknown
}

export async function listInstitutionAuditEvents(limit = 300): Promise<InstitutionAuditEventRow[]> {
  const { data, error } = await supabase.rpc('list_institution_audit_events', {
    p_limit: limit,
  })

  if (error) {
    console.error('listInstitutionAuditEvents:', error)
    throw new Error(error.message)
  }

  return (data ?? []) as InstitutionAuditEventRow[]
}
