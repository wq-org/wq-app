import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'

export async function listProgrammeOfferings(
  _programmeId: string,
): Promise<readonly ProgrammeOfferingRecord[]> {
  void _programmeId
  return Promise.resolve([])
}

export async function createProgrammeOffering(
  _input: Omit<ProgrammeOfferingRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
): Promise<ProgrammeOfferingRecord> {
  void _input
  throw new Error('createProgrammeOffering: not implemented')
}
