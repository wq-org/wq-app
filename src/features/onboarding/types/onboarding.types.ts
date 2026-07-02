export interface AvatarDisplayAttributes {
  name: string
  description: string
  emoji: string
}

export interface AvatarOption extends AvatarDisplayAttributes {
  src: string
}

export interface AccountDetailsData {
  username: string
  displayName: string
  description: string
  /** Optional new password (re-onboarding after an email change); undefined keeps the current one. */
  password?: string
}

export interface AccountData extends AccountDetailsData {
  avatar: AvatarOption
}

export interface StepAccountProps {
  onNext: (data: AccountDetailsData) => void
  initialData?: AccountDetailsData
  /** Show optional new-password fields (re-onboarding after an email change). */
  showPasswordFields?: boolean
}

export interface StepAvatarProps {
  onNext: (avatar: AvatarOption) => void
  onBack: () => void
  initialAvatarSrc?: string
}

export interface StepFinishProps {
  onBack: () => void
  onFinish: () => void
  accountData: AccountData
}
