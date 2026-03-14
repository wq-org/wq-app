import { USER_ROLES, type UserRole } from '@/features/auth'
import type { SettingsCapabilities } from '../types/settings.types'

export const settingsCapabilitiesByRole: Readonly<Record<UserRole, SettingsCapabilities>> = {
  [USER_ROLES.TEACHER]: {
    canEditLinkedIn: true,
    canEditAvatar: true,
    showRoleHint: true,
  },
  [USER_ROLES.STUDENT]: {
    canEditLinkedIn: true,
    canEditAvatar: true,
    showRoleHint: true,
  },
  [USER_ROLES.INSTITUTION_ADMIN]: {
    canEditLinkedIn: true,
    canEditAvatar: true,
    showRoleHint: false,
  },
  [USER_ROLES.SUPER_ADMIN]: {
    canEditLinkedIn: true,
    canEditAvatar: true,
    showRoleHint: false,
  },
} as const
