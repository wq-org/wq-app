import { USER_ROLES, isValidRole } from '@/features/auth'
import type { UserRole } from '@/features/auth'
import type {
  CommandBarContext,
  CommandBarView,
  CommandRoleContext,
} from '../types/command-bar.types'

export const COMMAND_BAR_VIEW_IDS = ['game-studio'] as const satisfies readonly CommandBarView[]

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  superadmin: USER_ROLES.SUPER_ADMIN,
  institutionadmin: USER_ROLES.INSTITUTION_ADMIN,
  teacher: USER_ROLES.TEACHER,
  student: USER_ROLES.STUDENT,
}

export const VALID_COMMAND_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.INSTITUTION_ADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.STUDENT,
] as const satisfies readonly CommandRoleContext[]

export function isCommandBarView(context: CommandBarContext | string): context is CommandBarView {
  return COMMAND_BAR_VIEW_IDS.includes(context as CommandBarView)
}

export function normalizeCommandRole(
  role: CommandRoleContext | string | null | undefined,
): CommandRoleContext | null {
  if (!role) return null

  const normalizedRole = role.trim().toLowerCase()
  if (isValidRole(normalizedRole)) {
    return normalizedRole
  }

  return LEGACY_ROLE_MAP[normalizedRole] ?? null
}
