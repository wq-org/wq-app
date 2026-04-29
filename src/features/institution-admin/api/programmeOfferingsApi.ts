import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { supabase } from '@/lib/supabase'

const COLUMNS =
  'id, institution_id, programme_id, academic_year, term_code, status, starts_at, ends_at, created_at, updated_at, deleted_at'

function toProgrammeOffering(row: ProgrammeOfferingRecord): ProgrammeOfferingRecord {
  return row
}

export async function listProgrammeOfferings(
  programmeId: string,
): Promise<readonly ProgrammeOfferingRecord[]> {
  const { data, error } = await supabase
    .from('programme_offerings')
    .select(COLUMNS)
    .eq('programme_id', programmeId)
    .is('deleted_at', null)
    .order('academic_year', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => toProgrammeOffering(row as ProgrammeOfferingRecord))
}

export async function createProgrammeOffering(
  input: Omit<ProgrammeOfferingRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
): Promise<ProgrammeOfferingRecord> {
  const { data, error } = await supabase
    .from('programme_offerings')
    .insert({
      institution_id: input.institution_id,
      programme_id: input.programme_id,
      academic_year: input.academic_year,
      term_code: input.term_code,
      status: input.status,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
    })
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toProgrammeOffering(data as ProgrammeOfferingRecord)
}

type UpdateProgrammeOfferingInput = {
  offeringId: string
  academic_year: number
  term_code: string | null
  starts_at: string | null
  ends_at: string | null
  status: ProgrammeOfferingRecord['status']
}

export async function updateProgrammeOffering({
  offeringId,
  academic_year,
  term_code,
  starts_at,
  ends_at,
  status,
}: UpdateProgrammeOfferingInput): Promise<ProgrammeOfferingRecord> {
  const { data, error } = await supabase
    .from('programme_offerings')
    .update({ academic_year, term_code, starts_at, ends_at, status })
    .eq('id', offeringId)
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toProgrammeOffering(data as ProgrammeOfferingRecord)
}

export async function archiveProgrammeOffering(
  offeringId: string,
): Promise<ProgrammeOfferingRecord> {
  const { data, error } = await supabase
    .from('programme_offerings')
    .update({ status: 'archived' })
    .eq('id', offeringId)
    .select(COLUMNS)
    .single()

  if (error) throw new Error(error.message)

  return toProgrammeOffering(data as ProgrammeOfferingRecord)
}

export async function listProgrammeOfferingsByInstitution(
  institutionId: string,
): Promise<readonly Pick<ProgrammeOfferingRecord, 'programme_id' | 'status'>[]> {
  const { data, error } = await supabase
    .from('programme_offerings')
    .select('programme_id, status')
    .eq('institution_id', institutionId)
    .is('deleted_at', null)

  if (error) throw new Error(error.message)

  return (data ?? []) as Pick<ProgrammeOfferingRecord, 'programme_id' | 'status'>[]
}
