import type { ClassroomMember } from '../types/classroom.types'

/**
 * Pure-functional eligibility filters for classroom teacher assignment.
 *
 * The student-vs-teacher constraint ("you cannot assign a student as main/co
 * teacher") is enforced at the institution-membership layer: the pickers only
 * load directory rows where `institution_memberships.membership_role` equals
 * `'teacher'`. Students never reach these utilities.
 *
 * What lives here are the **per-classroom** constraints that depend on the
 * current main teacher + active co-teachers of a single classroom:
 *
 *  - main teacher candidate: cannot already be a co-teacher in this classroom
 *  - co-teacher candidate:   cannot already be the main teacher in this classroom
 */

/**
 * User ids that must NOT be offered as candidates for becoming the
 * classroom's primary (main) teacher.
 *
 * Excludes:
 *  - the current primary teacher (no-op reassignment)
 *  - active co-teachers of this classroom (no dual role)
 */
export function getMainTeacherExclusions(
  members: readonly ClassroomMember[],
  currentPrimaryTeacherId: string | null,
): readonly string[] {
  const excluded = new Set<string>()
  if (currentPrimaryTeacherId) excluded.add(currentPrimaryTeacherId)
  for (const member of members) {
    if (member.role !== 'co_teacher') continue
    if (member.userId === currentPrimaryTeacherId) continue
    excluded.add(member.userId)
  }
  return Array.from(excluded)
}

/**
 * User ids that must NOT be offered as candidates for becoming a co-teacher
 * of this classroom.
 *
 * Excludes:
 *  - the current primary teacher (cannot dual-role; the primary already has
 *    a synthetic `co_teacher` row via `ensurePrimaryTeacherMembership`)
 *  - everyone currently in `classroom_members` with role `co_teacher`
 */
export function getCoTeacherExclusions(
  members: readonly ClassroomMember[],
  currentPrimaryTeacherId: string | null,
): readonly string[] {
  const excluded = new Set<string>()
  if (currentPrimaryTeacherId) excluded.add(currentPrimaryTeacherId)
  for (const member of members) {
    if (member.role === 'co_teacher') excluded.add(member.userId)
  }
  return Array.from(excluded)
}

/**
 * User ids that must NOT be offered as candidates for joining this
 * classroom as a student.
 *
 * Excludes everyone currently in `classroom_members` with role `'student'`.
 * The "students-only-from-institution" rule is enforced upstream by filtering
 * `institution_memberships.membership_role === 'student'`.
 */
export function getStudentExclusions(members: readonly ClassroomMember[]): readonly string[] {
  const excluded = new Set<string>()
  for (const member of members) {
    if (member.role === 'student') excluded.add(member.userId)
  }
  return Array.from(excluded)
}
