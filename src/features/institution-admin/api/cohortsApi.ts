import type { CohortRecord } from '../types/cohort.types'
import { supabase } from '@/lib/supabase'

export async function listCohortsByProgramme(
  programmeId: string,
): Promise<readonly CohortRecord[]> {
  const { data, error } = await supabase
    .from('cohorts')
    .select('*')
    .eq('programme_id', programmeId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as CohortRecord[]
}

export async function createCohort(
  input: Omit<CohortRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sort_order'> & {
    sort_order?: number
  },
): Promise<CohortRecord> {
  const { data, error } = await supabase
    .from('cohorts')
    .insert({
      institution_id: input.institution_id,
      programme_id: input.programme_id,
      name: input.name,
      description: input.description,
      academic_year: input.academic_year,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as CohortRecord
}
