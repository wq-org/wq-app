import { supabase } from '@/lib/supabase'

import type { EffectiveFeature, InstitutionQuotasUsage } from '../types/licensing.types'

async function countMembershipRole(
  institutionId: string,
  role: 'student' | 'teacher',
): Promise<number> {
  const { count, error } = await supabase
    .from('institution_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('institution_id', institutionId)
    .eq('membership_role', role)
    .is('deleted_at', null)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function countClassroomsForInstitution(institutionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('classrooms')
    .select('*', { count: 'exact', head: true })
    .eq('institution_id', institutionId)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

/**
 * Live usage from DB (membership/classroom counts + institution_quotas_usage storage/seats).
 * Caps default to null and are filled via {@link mergeInstitutionQuotasWithFeatures}.
 */
export async function fetchInstitutionUsageMetrics(
  institutionId: string,
): Promise<InstitutionQuotasUsage> {
  const [quotasResult, studentsUsed, teachersUsed, classroomsUsed] = await Promise.all([
    supabase
      .from('institution_quotas_usage')
      .select('seats_used, storage_used_bytes, updated_at')
      .eq('institution_id', institutionId)
      .maybeSingle(),
    countMembershipRole(institutionId, 'student'),
    countMembershipRole(institutionId, 'teacher'),
    countClassroomsForInstitution(institutionId),
  ])

  if (quotasResult.error) {
    throw new Error(quotasResult.error.message)
  }

  const row = quotasResult.data as {
    seats_used: number
    storage_used_bytes: string | number
    updated_at: string
  } | null

  const storageUsedBytes = Number(row?.storage_used_bytes ?? 0)

  return {
    seatsUsed: row?.seats_used ?? 0,
    seatsCap: null,
    studentsUsed,
    studentsCap: null,
    teachersUsed,
    teachersCap: null,
    classroomsUsed,
    classroomsCap: null,
    storageUsedBytes,
    storageBytesCap: null,
    updatedAt: row?.updated_at ?? new Date().toISOString(),
  }
}

function integerFeature(features: EffectiveFeature[], key: string): number | null {
  const f = features.find((x) => x.key === key)
  if (!f || f.integerValue == null) {
    return null
  }
  return f.integerValue
}

/** Applies plan + override entitlements for seat/storage caps (integer features). */
export function mergeInstitutionQuotasWithFeatures(
  metrics: InstitutionQuotasUsage,
  features: EffectiveFeature[],
): InstitutionQuotasUsage {
  const storageMb = integerFeature(features, 'storage_quota_mb')
  return {
    ...metrics,
    studentsCap: integerFeature(features, 'max_students'),
    teachersCap: integerFeature(features, 'max_teachers'),
    classroomsCap: integerFeature(features, 'max_classrooms'),
    storageBytesCap: storageMb != null ? String(BigInt(storageMb) * 1024n * 1024n) : null,
  }
}
