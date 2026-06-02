import { supabase } from '@/lib/supabase'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'

const COLUMNS =
  'id, institution_id, programme_offering_id, cohort_id, status, starts_at, ends_at, created_at, updated_at, deleted_at'

function toCohortOffering(row: CohortOfferingRecord): CohortOfferingRecord {
  return row
}

export async function listCohortOfferings(
  cohortId: string,
): Promise<readonly CohortOfferingRecord[]> {
  const { data, error } = await supabase
    .from('cohort_offerings')
    .select(COLUMNS)
    .eq('cohort_id', cohortId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => toCohortOffering(row as CohortOfferingRecord))
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
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toCohortOffering(data as CohortOfferingRecord)
}

type UpdateCohortOfferingInput = {
  offeringId: string
  programme_offering_id: string
  status: CohortOfferingRecord['status']
  starts_at: string | null
  ends_at: string | null
}

export async function updateCohortOffering({
  offeringId,
  programme_offering_id,
  status,
  starts_at,
  ends_at,
}: UpdateCohortOfferingInput): Promise<CohortOfferingRecord> {
  const { data, error } = await supabase
    .from('cohort_offerings')
    .update({ programme_offering_id, status, starts_at, ends_at })
    .eq('id', offeringId)
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toCohortOffering(data as CohortOfferingRecord)
}

export async function archiveCohortOffering(offeringId: string): Promise<CohortOfferingRecord> {
  const { data, error } = await supabase
    .from('cohort_offerings')
    .update({ status: 'archived' })
    .eq('id', offeringId)
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toCohortOffering(data as CohortOfferingRecord)
}
