import { supabase } from '@/lib/supabase'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'

const COLUMNS =
  'id, institution_id, cohort_offering_id, class_group_id, status, starts_at, ends_at, created_at, updated_at, deleted_at'

function toClassGroupOffering(row: ClassGroupOfferingRecord): ClassGroupOfferingRecord {
  return row
}

export async function listClassGroupOfferings(
  classGroupId: string,
): Promise<readonly ClassGroupOfferingRecord[]> {
  const { data, error } = await supabase
    .from('class_group_offerings')
    .select(COLUMNS)
    .eq('class_group_id', classGroupId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => toClassGroupOffering(row as ClassGroupOfferingRecord))
}

export async function createClassGroupOffering(
  input: Omit<ClassGroupOfferingRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
): Promise<ClassGroupOfferingRecord> {
  const { data, error } = await supabase
    .from('class_group_offerings')
    .insert({
      institution_id: input.institution_id,
      cohort_offering_id: input.cohort_offering_id,
      class_group_id: input.class_group_id,
      status: input.status,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
    })
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toClassGroupOffering(data as ClassGroupOfferingRecord)
}
