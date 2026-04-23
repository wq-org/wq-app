import type { ProgrammeRecord } from '../types/programme.types'

export async function listProgrammesByFaculty(
  _facultyId: string,
): Promise<readonly ProgrammeRecord[]> {
  void _facultyId
  return Promise.resolve([])
}

export async function createProgramme(
  _input: Omit<
    ProgrammeRecord,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sort_order'
  > & { sort_order?: number },
): Promise<ProgrammeRecord> {
  void _input
  throw new Error('createProgramme: not implemented')
}
