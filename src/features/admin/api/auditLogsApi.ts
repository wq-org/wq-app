import { supabase } from '@/lib/supabase'

export type AuditEventRow = {
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

export async function listAuditEvents(limit = 300): Promise<AuditEventRow[]> {
  const { data, error } = await supabase.rpc('list_admin_audit_events', {
    p_limit: limit,
  })

  if (error) {
    console.error('listAuditEvents:', error)
    throw new Error(error.message)
  }

  return (data ?? []) as AuditEventRow[]
}
