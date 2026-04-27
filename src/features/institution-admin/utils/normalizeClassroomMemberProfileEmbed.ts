import type { ClassroomMemberProfile, ClassroomMemberRow } from '../types/classroom.types'

function isSingleEmbeddedClassroomProfile(
  value: ClassroomMemberProfile | readonly ClassroomMemberProfile[],
): value is ClassroomMemberProfile {
  return !Array.isArray(value)
}

/**
 * Normalizes PostgREST `profiles(...)` embeds: Supabase typings may represent
 * the FK embed as one object or as a readonly array; callers always receive a single profile or null.
 */
export function normalizeClassroomMemberProfileEmbed(
  profiles: ClassroomMemberRow['profiles'],
): ClassroomMemberProfile | null {
  if (profiles == null) return null
  if (isSingleEmbeddedClassroomProfile(profiles)) return profiles
  return profiles[0] ?? null
}
