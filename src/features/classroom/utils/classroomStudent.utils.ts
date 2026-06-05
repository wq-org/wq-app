import type {
  ClassroomStudent,
  ClassroomStudentProfile,
  ClassroomStudentRow,
} from '../types/classroom.types'

function isSingleEmbeddedProfile(
  value: ClassroomStudentProfile | readonly ClassroomStudentProfile[],
): value is ClassroomStudentProfile {
  return !Array.isArray(value)
}

function normalizeStudentProfileEmbed(
  profiles: ClassroomStudentRow['profiles'],
): ClassroomStudentProfile | null {
  if (profiles == null) return null
  if (isSingleEmbeddedProfile(profiles)) return profiles
  return profiles[0] ?? null
}

export function getStudentInitial(name: string | null | undefined): string {
  const trimmed = name?.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?'
}

export function getStudentDisplayLabel(
  student: Pick<ClassroomStudent, 'displayName' | 'username' | 'name'>,
): string {
  return student.displayName || student.username || student.name
}

export function filterClassroomStudentsByQuery(
  students: readonly ClassroomStudent[],
  query: string,
): ClassroomStudent[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return [...students]
  }

  return students.filter((student) => {
    const searchableValues = [student.displayName, student.username].filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    )

    return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery))
  })
}

export function mapClassroomStudentRow(row: ClassroomStudentRow): ClassroomStudent {
  const profile = normalizeStudentProfileEmbed(row.profiles)
  const displayName = profile?.display_name?.trim() || null
  const username = profile?.username?.trim() || null
  const email = profile?.email?.trim() || ''
  const name = displayName || username || email || row.user_id

  return {
    id: row.id,
    userId: row.user_id,
    displayName,
    username,
    name,
    email,
    description: profile?.description?.trim() || null,
    avatarUrl: profile?.avatar_url || null,
  }
}
