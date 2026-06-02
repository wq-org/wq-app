import { USER_ROLES, type UserRole } from '@/features/auth'

export function roleForUpload(role: UserRole | null): string | null {
  if (!role) {
    return null
  }

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
