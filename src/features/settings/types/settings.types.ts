import type { UserRole } from '@/features/auth'

export type SettingsFormValues = {
  displayName: string
  linkedIn: string
  aboutMe: string
}

export type SettingsSaveValues = SettingsFormValues & {
  avatarPath: string
}

export type SettingsCapabilities = {
  canEditLinkedIn: boolean
  canEditAvatar: boolean
  showRoleHint: boolean
}

export type SettingsPageProps = {
  role: UserRole
  /** Omit standalone page chrome (min-h-screen + nested container). Use inside admin workspace shell. */
  embedded?: boolean
}
