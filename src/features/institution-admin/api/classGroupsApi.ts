import { supabase } from '@/lib/supabase'
import type { ClassGroupRecord } from '../types/class-group.types'

export async function listClassGroupsByCohort(
  cohortId: string,
): Promise<readonly ClassGroupRecord[]> {
  const { data, error } = await supabase
    .from('class_groups')
    .select('*')
    .eq('cohort_id', cohortId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as ClassGroupRecord[]
}

export async function createClassGroup(
  input: Omit<
    ClassGroupRecord,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sort_order'
  > & {
    sort_order?: number
  },
): Promise<ClassGroupRecord> {
  const { data, error } = await supabase
    .from('class_groups')
    .insert({
      institution_id: input.institution_id,
      cohort_id: input.cohort_id,
      name: input.name,
      description: input.description,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as ClassGroupRecord
}
