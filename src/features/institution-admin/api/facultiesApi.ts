import { supabase } from '@/lib/supabase'
import type { FacultySummary } from '../types/faculty.types'

type FacultyRecord = FacultySummary & {
  institution_id: string
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const COLUMNS =
  'id, name, description, institution_id, sort_order, created_at, updated_at, deleted_at'

function toFaculty(row: FacultyRecord): FacultyRecord {
  return row
}

export async function fetchFaculty(facultyId: string): Promise<FacultySummary> {
  const { data, error } = await supabase
    .from('faculties')
    .select('id, name, description')
    .eq('id', facultyId)
    .single()

  if (error) throw new Error(error.message)

  return data as FacultySummary
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
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toFaculty(data as FacultyRecord)
}

export async function updateFaculty(input: {
  institution_id: string
  faculty_id: string
  name: string
  description: string | null
}): Promise<FacultySummary> {
  const { data, error } = await supabase
    .from('faculties')
    .update({
      name: input.name,
      description: input.description,
    })
    .eq('id', input.faculty_id)
    .eq('institution_id', input.institution_id)
    .select('id, name, description')
    .single()

  if (error) throw new Error(error.message)

  return data as FacultySummary
}
