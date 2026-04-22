import { supabase } from '@/lib/supabase'
import type { FacultySummary } from '../types/faculty.types'

type FacultyRecord = FacultySummary & {
  institution_id: string
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function listFacultiesByInstitution(
  institutionId: string,
): Promise<readonly FacultySummary[]> {
  const { data, error } = await supabase
    .from('faculties')
    .select('id, name, description')
    .eq('institution_id', institutionId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as FacultySummary[]
}

export async function createFaculty(input: {
  institution_id: string
  name: string
  description: string | null
  sort_order?: number
}): Promise<FacultyRecord> {
  const { data, error } = await supabase
    .from('faculties')
    .insert({
      institution_id: input.institution_id,
      name: input.name,
      description: input.description,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  return data as FacultyRecord
}
