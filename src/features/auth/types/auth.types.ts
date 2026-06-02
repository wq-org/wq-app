/**
 * User roles in the platform.
 * IMPORTANT: Must match CHECK constraint on profiles.role (snake_case).
 */
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  INSTITUTION_ADMIN: 'institution_admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

/** Type guard for runtime validation (e.g. API responses). */
export function isValidRole(role: string): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole)
}

/** Profile shape aligned with profiles table (user_id, is_onboarded, role snake_case). */
export interface UserProfile {
  user_id: string
  email: string | null
  display_name: string | null
  username: string | null
  role: UserRole | null
  is_onboarded: boolean
  avatar_url: string | null
  description: string | null
  linkedin_url: string | null
  follow_count?: number | null
  userInstitutionId?: string | null
  institution?: {
    id: string
    name: string | null
    slug: string | null
    email: string | null
  } | null
  created_at?: string
  updated_at?: string
}

/** Convenience: true when role is super_admin. */
export function isSuperAdmin(profile: { role: string | null }): boolean {
  return profile.role === USER_ROLES.SUPER_ADMIN
}

/** App path prefix for a role (`/teacher`, `/student`, …). Single source for settings, command bar, and nav. */
export function getRoleRoutePrefix(role: UserRole | null): string | null {
  if (!role) return null
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return '/super_admin'
    case USER_ROLES.INSTITUTION_ADMIN:
      return '/institution_admin'
    case USER_ROLES.TEACHER:
      return '/teacher'
    case USER_ROLES.STUDENT:
      return '/student'
    default:
      return null
  }
}

/** Settings URL for the role (`/teacher/settings`, …). */
export function getRoleSettingsPath(role: UserRole | null): string | null {
  const prefix = getRoleRoutePrefix(role)
  if (!prefix) return null
  return `${prefix}/settings`
}

/** Map UserRole to dashboard path (URLs use teacher/student/admin, not snake_case). */
export function getDashboardPathForRole(role: UserRole | null): string {
  if (!role) return '/onboarding'
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return '/super_admin/dashboard'
    case USER_ROLES.INSTITUTION_ADMIN:
      return '/institution_admin/dashboard'
    case USER_ROLES.TEACHER:
      return '/teacher/dashboard'
    case USER_ROLES.STUDENT:
      return '/student/dashboard'
    default:
      return '/onboarding'
  }
}

// --- Legacy / other auth types ---

export interface User {
  id: string
  userName: string
  name: string
  email: string
  role: UserRole
}

export interface SignUpData {
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  user_id: string
  username: string
  display_name: string
  email: string
  role: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyEmailData {
  token: string
}
