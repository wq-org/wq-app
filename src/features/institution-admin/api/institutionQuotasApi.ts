import type { InstitutionQuotasUsage } from '../types/licensing.types'

/**
 * Mock quotas usage. Swap this for a real Supabase query once a
 * `institution_quotas_usage` table is introduced.
 */
export async function fetchInstitutionQuotasUsage(
  institutionId: string,
): Promise<InstitutionQuotasUsage | null> {
  if (!institutionId) return null
  return {
    seatsUsed: 42,
    seatsCap: 100,
    studentsUsed: 310,
    studentsCap: 500,
    teachersUsed: 18,
    teachersCap: 30,
    storageUsedBytes: 6_300_000_000,
    storageBytesCap: '10737418240',
    updatedAt: new Date().toISOString(),
  }
}
