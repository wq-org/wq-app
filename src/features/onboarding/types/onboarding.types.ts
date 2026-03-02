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
}

export interface Institution {
  id: string
  name: string
  description: string | null
  email: string | null
  address: Record<string, string> | null
  website: string | null
}

export interface AccountData extends AccountDetailsData {
  avatar: AvatarOption
}

export interface StepAccountProps {
  onNext: (data: AccountDetailsData) => void
  initialData?: AccountDetailsData
}

export interface StepAvatarProps {
  onNext: (avatar: AvatarOption) => void
  onBack: () => void
  initialAvatarSrc?: string
}

export interface StepInstitutionProps {
  onNext: (selectedInstitutions: Institution[]) => void
  onBack: () => void
  initialData?: string[]
}

export interface StepFinishProps {
  onBack: () => void
  onFinish: () => void
  accountData: AccountData
  institutions: Institution[]
}
