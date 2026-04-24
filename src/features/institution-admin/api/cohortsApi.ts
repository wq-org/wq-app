import type { CohortRecord } from '../types/cohort.types'
import { supabase } from '@/lib/supabase'

export async function listCohortsByInstitution(
  institutionId: string,
): Promise<readonly CohortRecord[]> {
  const { data, error } = await supabase
    .from('cohorts')
    .select('*')
    .eq('institution_id', institutionId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as CohortRecord[]
}

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

type UpdateCohortInput = {
  cohortId: string
  name: string
  description: string | null
}

export async function updateCohort({
  cohortId,
  name,
  description,
}: UpdateCohortInput): Promise<CohortRecord> {
  const { data, error } = await supabase
    .from('cohorts')
    .update({ name, description })
    .eq('id', cohortId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as CohortRecord
}
