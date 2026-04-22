import { supabase } from '@/lib/supabase'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'

export async function listCohortOfferings(
  cohortId: string,
): Promise<readonly CohortOfferingRecord[]> {
  const { data, error } = await supabase
    .from('cohort_offerings')
    .select('*')
    .eq('cohort_id', cohortId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as CohortOfferingRecord[]
}

export async function createCohortOffering(
  input: Omit<CohortOfferingRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
): Promise<CohortOfferingRecord> {
  const { data, error } = await supabase
    .from('cohort_offerings')
    .insert({
      institution_id: input.institution_id,
      programme_offering_id: input.programme_offering_id,
      cohort_id: input.cohort_id,
      status: input.status,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as CohortOfferingRecord
}
