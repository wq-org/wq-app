import type { ProgrammeRecord } from '../types/programme.types'
import { supabase } from '@/lib/supabase'

export async function listProgrammesByFaculty(
  facultyId: string,
): Promise<readonly ProgrammeRecord[]> {
  const { data, error } = await supabase
    .from('programmes')
    .select('*')
    .eq('faculty_id', facultyId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as ProgrammeRecord[]
}

export async function createProgramme(
  input: Omit<ProgrammeRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sort_order'> & {
    sort_order?: number
  },
): Promise<ProgrammeRecord> {
  const { data, error } = await supabase
    .from('programmes')
    .insert({
      institution_id: input.institution_id,
      faculty_id: input.faculty_id,
      name: input.name,
      description: input.description,
      duration_years: input.duration_years,
      progression_type: input.progression_type,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as ProgrammeRecord
}
