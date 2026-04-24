import { supabase } from '@/lib/supabase'
import type { ClassGroupRecord } from '../types/class-group.types'

export async function listClassGroupsByInstitution(
  institutionId: string,
): Promise<readonly ClassGroupRecord[]> {
  const { data, error } = await supabase
    .from('class_groups')
    .select('*')
    .eq('institution_id', institutionId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as ClassGroupRecord[]
}

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

type UpdateClassGroupInput = {
  classGroupId: string
  name: string
  description: string | null
}

export async function updateClassGroup({
  classGroupId,
  name,
  description,
}: UpdateClassGroupInput): Promise<ClassGroupRecord> {
  const { data, error } = await supabase
    .from('class_groups')
    .update({ name, description })
    .eq('id', classGroupId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as ClassGroupRecord
}
