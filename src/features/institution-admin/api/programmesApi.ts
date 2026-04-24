import type { ProgrammeRecord } from '../types/programme.types'
import { supabase } from '@/lib/supabase'

const COLUMNS =
  'id, institution_id, faculty_id, name, description, duration_years, progression_type, sort_order, created_at, updated_at, deleted_at'

function toProgramme(row: ProgrammeRecord): ProgrammeRecord {
  return row
}

export async function listProgrammesByInstitution(
  institutionId: string,
): Promise<readonly ProgrammeRecord[]> {
  const { data, error } = await supabase
    .from('programmes')
    .select(COLUMNS)
    .eq('institution_id', institutionId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => toProgramme(row as ProgrammeRecord))
}

export async function listProgrammesByFaculty(
  facultyId: string,
): Promise<readonly ProgrammeRecord[]> {
  const { data, error } = await supabase
    .from('programmes')
    .select(COLUMNS)
    .eq('faculty_id', facultyId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => toProgramme(row as ProgrammeRecord))
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
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toProgramme(data as ProgrammeRecord)
}

type UpdateProgrammeInput = {
  programmeId: string
  name: string
  description: string | null
}

export async function updateProgramme({
  programmeId,
  name,
  description,
}: UpdateProgrammeInput): Promise<ProgrammeRecord> {
  const { data, error } = await supabase
    .from('programmes')
    .update({ name, description })
    .eq('id', programmeId)
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toProgramme(data as ProgrammeRecord)
}
