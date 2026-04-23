import type { CohortRecord } from '../types/cohort.types'

export async function listCohortsByProgramme(
  _programmeId: string,
): Promise<readonly CohortRecord[]> {
  void _programmeId
  return Promise.resolve([])
}

export async function createCohort(
  _input: Omit<CohortRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sort_order'> & {
    sort_order?: number
  },
): Promise<CohortRecord> {
  void _input
  throw new Error('createCohort: not implemented')
}
