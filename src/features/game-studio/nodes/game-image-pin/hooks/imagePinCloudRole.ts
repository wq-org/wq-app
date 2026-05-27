import { USER_ROLES, type UserRole } from '@/features/auth'

/** Maps app profile role to the segment used in cloud storage paths (matches `uploadFilesApi`). */
export function mapUserRoleToCloudPathRole(role: UserRole | null): string | null {
  if (!role) return null
  switch (role) {
    case USER_ROLES.TEACHER:
      return 'teacher'
    case USER_ROLES.STUDENT:
      return 'student'
    case USER_ROLES.INSTITUTION_ADMIN:
      return 'institutionAdmin'
    case USER_ROLES.SUPER_ADMIN:
      return 'superAdmin'
    default:
      return null
  }
}

/** Same folder segment rules as `pathRole` in `uploadFilesApi`. */
export function pathSegmentForCloudStorage(role: string): string {
  const r = role.trim()
  if (r.toLowerCase() === 'teachers') return 'teacher'
  return r
}

export function buildCloudUserObjectPrefix(
  institutionId: string,
  role: string,
  userId: string,
): string {
  const inst = institutionId.trim()
  const uid = userId.trim()
  const seg = pathSegmentForCloudStorage(role)
  return `${inst}/${seg}/${uid}/`
}
