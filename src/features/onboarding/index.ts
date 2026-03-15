export { EmptyInstitutionView } from './components/EmptyInstitutionView'
export { StepAccount } from './components/StepAccount'
export { StepAvatar } from './components/StepAvatar'
export { StepFinish } from './components/StepFinish'
export { StepInstitution } from './components/StepInstitution'
export { SuccessPage } from './components/SuccessPage'
export { useAvatarUrl } from './hooks/useAvatarUrl'
export type {
  AvatarDisplayAttributes,
  AvatarOption,
  AccountDetailsData,
  Institution,
  AccountData,
  StepAccountProps,
  StepAvatarProps,
  StepInstitutionProps,
  StepFinishProps,
} from './types/onboarding.types'
export { fetchAvatars, fetchInstitutions, linkUserInstitutions } from './api/onboardingApi'
